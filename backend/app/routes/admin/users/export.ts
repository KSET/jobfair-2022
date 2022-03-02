import ExcelJS from "exceljs";
import {
  omit,
} from "rambdax";
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

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      firstName: true,
      lastName: true,
      email: true,
      companies: {
        select: {
          vat: true,
          brandName: true,
          legalName: true,
          applications: {
            select: {
              talk: {
                select: {
                  titleEn: true,
                },
              },
              workshop: {
                select: {
                  titleEn: true,
                },
              },
              booth: true,
              wantsCocktail: true,
              wantsPanel: true,
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
          },
        },
      },
    },
  });

  const booths = new Map((await BoothsService.fetchBooths()).filter((b) => b.key).map((b) => [ b.key, b.name ]));

  const withoutCompanies = users.filter(({ companies }) => 0 === companies.length);
  const inCompanies = users.filter(({ companies }) => 0 < companies.length);
  const withApplications = inCompanies.filter(({ companies }) => 0 < companies[0].applications.length);

  const workbook = new ExcelJS.Workbook();

  {
    const worksheet = workbook.addWorksheet("Korisnici bez firmi");
    worksheet.columns = [
      { header: "Ime", key: "firstName" },
      { header: "Prezime", key: "lastName" },
      { header: "Email", key: "email" },
    ];
    for (const user of withoutCompanies) {
      worksheet.addRow(omit(
        [
          "companies",
        ],
        user,
      ));
    }
  }

  {
    const worksheet = workbook.addWorksheet("Korisnici s prijavljenom firmom");
    worksheet.columns = [
      { header: "Ime", key: "firstName" },
      { header: "Prezime", key: "lastName" },
      { header: "Email", key: "email" },
      { header: "VAT", key: "vat" },
      { header: "Brand ime", key: "brandName" },
      { header: "Legalno ime", key: "legalName" },
      { header: "Talk", key: "talk" },
      { header: "Workshop", key: "workshop" },
      { header: "Štand", key: "booth" },
      { header: "Koktel", key: "cocktail" },
      { header: "Panel", key: "panel" },
    ];
    for (const user of withApplications) {
      const u = omit(
        [
          "companies",
        ],
        user,
      );
      const [ company ] = user.companies;
      const [ application ] = company.applications;

      worksheet.addRow({
        ...u,
        ...omit(
          [
            "applications",
          ],
          company,
        ),
        talk: application.talk?.titleEn || "",
        workshop: application.workshop?.titleEn || "",
        booth: booths.has(application.booth) ? booths.get(application.booth) : "",
        panel: application.wantsPanel ? "da" : "ne",
        cocktail: application.wantsCocktail ? "da" : "ne",
      });
    }
  }

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "max-age=315360000,public,immutable")
    .header("content-disposition", contentDisposition("korisnici.xlsx"))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
