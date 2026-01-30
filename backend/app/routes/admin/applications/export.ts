import ExcelJS from "exceljs";
import contentDisposition from "content-disposition";
import {
  AuthRouter,
} from "../../../helpers/route";
import {
  Role,
} from "../../../helpers/auth";
import {
  prisma,
} from "../../../providers/prisma";
import {
  BoothsService,
} from "../../../services/booths-service";
import {
  BUCKET_NAME,
  minio,
} from "../../../providers/minio";

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", async (req, res) => {
  const applications = await prisma.companyApplication.findMany({
    select: {
      forCompany: {
        select: {
          vat: true,
          brandName: true,
          legalName: true,
          descriptionEn: true,
          descriptionHr: true,
          industry: {
            select: {
              name: true,
            },
          },
          members: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      booth: true,
      talk: {
        select: {
          titleEn: true,
          titleHr: true,
          descriptionEn: true,
          descriptionHr: true,
          language: true,
          category: {
            select: {
              name: true,
            },
          },
          presenters: {
            select: {
              firstName: true,
              lastName: true,
              bioEn: true,
              bioHr: true,
              photo: {
                select: {
                  uid: true,
                  full: true,
                },
              },
            },
          },
        },
      },
      workshop: {
        select: {
          titleEn: true,
          titleHr: true,
          descriptionEn: true,
          descriptionHr: true,
          language: true,
          goal: true,
          presenters: {
            select: {
              firstName: true,
              lastName: true,
              bioEn: true,
              bioHr: true,
              photo: {
                select: {
                  uid: true,
                  full: true,
                },
              },
            },
          },
        },
      },
      wantsPanel: true,
      wantsCocktail: true,
      wantsQuest: true,
    },

    where: {
      forSeason: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
    },
  });

  const booths = new Map((await BoothsService.fetchBooths()).filter((b) => b.key).map((b) => [ b.key, b.name ]));

  const workbook = new ExcelJS.Workbook();

  const imagePromises =
    applications
      .flatMap((app) => {
        const ret = [];

        if (app.talk) {
          ret.push(...app.talk.presenters.map((x) => x.photo!));
        }

        if (app.workshop) {
          ret.push(...app.workshop.presenters.map((x) => x.photo!));
        }

        return ret;
      })
      .map(async (image) => {
        const minioFile = await minio.getObject(BUCKET_NAME, image.full.minioKey);

        const buff: Buffer | null = await new Promise((resolve) => {
          const parts: Buffer[] = [];
          minioFile.on("data", (data: Buffer) => {
            parts.push(data);
          });

          minioFile.on("end", () => {
            resolve(Buffer.concat(parts));
          });

          minioFile.on("error", () => {
            resolve(null);
          });
        });

        return [
          image.uid,
          `data:${ image.full.mimeType };base64,${ buff?.toString("base64") || "" }`,
        ] as const;
      })
  ;
  const images = new Map(await Promise.all(imagePromises));

  {
    const worksheet = workbook.addWorksheet("Prijave");

    const IMAGE_SIZE = 80 as const;
    const MAX_PRESENTERS_TALK = Math.max(...applications.map((x) => x.talk?.presenters.length || 0));
    const MAX_PRESENTERS_WORKSHOP = Math.max(...applications.map((x) => x.workshop?.presenters.length || 0));

    worksheet.columns = [
      { header: "Naziv poduzeća", key: "brandName" },
      { header: "Industrija", key: "industry" },
      { header: "Ime brenda", key: "legalName" },
      { header: "Kontakt osoba", key: "contactName" },
      { header: "Email kontakt osobe", key: "contactEmail" },
      { header: "Broj telefona", key: "contactPhone" },
      { header: "Opis poduzeća", key: "description" },
      { header: "Štand", key: "booth" },
      { header: "Talk kategorija", key: "talkCategory" },
      { header: "Talk naslov", key: "talkTitle" },
      { header: "Talk opis", key: "talkDescription" },
      ...Array.from({ length: MAX_PRESENTERS_TALK }, (_, i) => [
        { header: `Talk predavać ime ${ i + 1 }`, key: `talkPresenterName${ i }` },
        { header: `Talk predavać bio ${ i + 1 }`, key: `talkPresenterBio${ i }` },
        { header: `Talk predavać slika ${ i + 1 }`, key: `talkPresenterImage${ i }`, width: IMAGE_SIZE / 6 },
      ]).flat(),
      { header: "Workshop naslov", key: "workshopTitle" },
      { header: "Workshop opis", key: "workshopDescription" },
      { header: "Workshop cilj", key: "workshopGoal" },
      ...Array.from({ length: MAX_PRESENTERS_WORKSHOP }, (_, i) => [
        { header: `Workshop predavać ime ${ i + 1 }`, key: `workshopPresenterName${ i }` },
        { header: `Workshop predavać bio ${ i + 1 }`, key: `workshopPresenterBio${ i }` },
        { header: `Workshop predavać slika ${ i + 1 }`, key: `workshopPresenterImage${ i }`, width: IMAGE_SIZE / 6 },
      ]).flat(),
      { header: "Panel", key: "panel" },
      { header: "King of Cocktails", key: "cocktail" },
      { header: "Quest", key: "quest" },
    ];
    for (const application of applications) {
      const {
        forCompany: company,
        booth,
        talk,
        workshop,
        wantsPanel,
        wantsCocktail,
        wantsQuest,
      } = application;
      const [
        contact = {
          firstName: "{UNKNOWN FIRST NAME}",
          lastName: "{UNKNOWN LAST NAME}",
          email: "{UNKNOWN EMAIL}",
          phone: "{UNKNOWN PHONE}",
        },
      ] = company.members;

      if (!contact) {
        continue;
      }

      const row = worksheet.addRow({
        brandName: company.brandName,
        legalName: company.legalName,
        industry: company.industry.name,
        contactName: `${ contact.firstName } ${ contact.lastName }`,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        description: company.descriptionHr || company.descriptionEn,
        booth: booths.has(booth) ? booths.get(booth)! : "",
        talkCategory: "",
        talkTitle: "",
        talkDescription: "",
        ...Object.fromEntries(
          Array.from({ length: MAX_PRESENTERS_TALK }, (_, i) => [
            [ `talkPresenterName${ i }`, "" ],
            [ `talkPresenterBio${ i }`, "" ],
            [ `talkPresenterImage${ i }`, "" ],
          ] as const).flat(),
        ),
        workshopTitle: "",
        workshopDescription: "",
        workshopGoal: "",
        ...Object.fromEntries(
          Array.from({ length: MAX_PRESENTERS_WORKSHOP }, (_, i) => [
            [ `workshopPresenterName${ i }`, "" ],
            [ `workshopPresenterBio${ i }`, "" ],
            [ `workshopPresenterImage${ i }`, "" ],
          ] as const).flat(),
        ),
        panel: "Ne",
        cocktail: "Ne",
        quest: "Ne",
      });

      row.height = IMAGE_SIZE;

      type Photo = NonNullable<typeof talk>["presenters"][0]["photo"];

      const addImage = (cellName: string, photo: Photo) => {
        if (!photo) {
          return;
        }

        const id = workbook.addImage({
          base64: images.get(photo.uid)!,
          extension: "image/png" === photo.full.mimeType ? "png" : "jpeg",
        });
        const cell = row.getCell(cellName);

        worksheet.addImage(id, {
          tl: {
            col: cell.fullAddress.col - 1,
            row: cell.fullAddress.row - 1,
          },
          ext: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
          },
          editAs: undefined,
          hyperlinks: {
            hyperlink: `https://jobfair.fer.unizg.hr/api/i/${ photo.uid }/full`,
            tooltip: `https://jobfair.fer.unizg.hr/api/i/${ photo.uid }/full`,
          },
        });
      };

      if (talk) {
        row.getCell("talkCategory").value = talk.category.name;
        row.getCell("talkTitle").value = "hr_HR" === talk.language ? talk.titleHr : talk.titleEn;
        row.getCell("talkDescription").value = "hr_HR" === talk.language ? talk.descriptionHr : talk.descriptionEn;
        talk.presenters.forEach((presenter, i) => {
          row.getCell(`talkPresenterName${ i }`).value = `${ presenter.firstName } ${ presenter.lastName }`;
          row.getCell(`talkPresenterBio${ i }`).value = "hr_HR" === talk.language ? presenter.bioHr : presenter.bioEn;
          addImage(
            `talkPresenterImage${ i }`,
            presenter.photo,
          );
        });
      }

      if (workshop) {
        row.getCell("workshopTitle").value = "hr_HR" === workshop.language ? workshop.titleHr : workshop.titleEn;
        row.getCell("workshopDescription").value = "hr_HR" === workshop.language ? workshop.descriptionHr : workshop.descriptionEn;
        row.getCell("workshopGoal").value = workshop.goal;
        workshop.presenters.forEach((presenter, i) => {
          row.getCell(`workshopPresenterName${ i }`).value = `${ presenter.firstName } ${ presenter.lastName }`;
          row.getCell(`workshopPresenterBio${ i }`).value = "hr_HR" === workshop.language ? presenter.bioHr : presenter.bioEn;
          addImage(
            `workshopPresenterImage${ i }`,
            presenter.photo,
          );
        });
      }

      if (wantsPanel) {
        row.getCell("panel").value = "Da";
      }

      if (wantsCocktail) {
        row.getCell("cocktail").value = "Da";
      }

      if (wantsQuest) {
        row.getCell("quest").value = "Da";
      }
    }

    // worksheet.eachColumnKey((col) => {
    //   let maxLen = 0;
    //
    //   col.eachCell({ includeEmpty: true }, (cell) => {
    //     maxLen = Math.max(
    //       maxLen,
    //       cell.value
    //         ? cell.value.toString().length
    //         : 10
    //       ,
    //     );
    //   });
    //
    //   col.width = Math.max(10, maxLen);
    // });
  }

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition("prijave.xlsx"))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
