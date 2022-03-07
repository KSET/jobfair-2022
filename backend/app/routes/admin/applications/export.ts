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
          ret.push(app.talk.presenters[0].photo!);
        }

        if (app.workshop) {
          ret.push(app.workshop.presenters[0].photo!);
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
      { header: "Talk predavać ime", key: "talkPresenterName" },
      { header: "Talk predavać bio", key: "talkPresenterBio" },
      { header: "Talk predavać slika", key: "talkPresenterImage", width: IMAGE_SIZE / 6 },
      { header: "Workshop naslov", key: "workshopTitle" },
      { header: "Workshop opis", key: "workshopDescription" },
      { header: "Workshop cilj", key: "workshopGoal" },
      { header: "Workshop predavać ime", key: "workshopPresenterName" },
      { header: "Workshop predavać bio", key: "workshopPresenterBio" },
      { header: "Workshop predavać slika", key: "workshopPresenterImage", width: IMAGE_SIZE / 6 },
      { header: "Panel", key: "panel" },
      { header: "King of Cocktails", key: "cocktail" },
    ];
    for (const application of applications) {
      const {
        forCompany: company,
        booth,
        talk,
        workshop,
        wantsPanel,
        wantsCocktail,
      } = application;
      const [
        contact,
      ] = company.members;

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
        talkPresenterName: "",
        talkPresenterBio: "",
        talkPresenterImage: "",
        workshopTitle: "",
        workshopDescription: "",
        workshopGoal: "",
        workshopPresenterName: "",
        workshopPresenterBio: "",
        workshopPresenterImage: "",
        panel: "Ne",
        cocktail: "Ne",
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
        const [ presenter ] = talk.presenters;

        row.getCell("talkCategory").value = talk.category.name;
        row.getCell("talkTitle").value = "hr_HR" === talk.language ? talk.titleHr : talk.titleEn;
        row.getCell("talkDescription").value = "hr_HR" === talk.language ? talk.descriptionHr : talk.descriptionEn;
        row.getCell("talkPresenterName").value = `${ presenter.firstName } ${ presenter.lastName }`;
        row.getCell("talkPresenterBio").value = "hr_HR" === talk.language ? presenter.bioHr : presenter.bioEn;
        addImage(
          "talkPresenterImage",
          presenter.photo,
        );
      }

      if (workshop) {
        const [ presenter ] = workshop.presenters;

        row.getCell("workshopTitle").value = "hr_HR" === workshop.language ? workshop.titleHr : workshop.titleEn;
        row.getCell("workshopDescription").value = "hr_HR" === workshop.language ? workshop.descriptionHr : workshop.descriptionEn;
        row.getCell("workshopGoal").value = workshop.goal;
        row.getCell("workshopPresenterName").value = `${ presenter.firstName } ${ presenter.lastName }`;
        row.getCell("workshopPresenterBio").value = "hr_HR" === workshop.language ? presenter.bioHr : presenter.bioEn;
        addImage(
          "workshopPresenterImage",
          presenter.photo,
        );
      }

      if (wantsPanel) {
        row.getCell("panel").value = "Da";
      }

      if (wantsCocktail) {
        row.getCell("cocktail").value = "Da";
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
