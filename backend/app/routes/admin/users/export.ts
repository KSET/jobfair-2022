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
              booth: true,
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

  const withoutCompanies = users.filter(({ companies }) => 0 === companies.length);
  const inCompanies = users.filter(({ companies }) => 0 < companies.length);
  const withoutApplications = inCompanies.filter(({ companies }) => 0 === companies[0].applications.length);

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
    const worksheet = workbook.addWorksheet("Korisnici u firmi bez prijave");
    worksheet.columns = [
      { header: "Ime", key: "firstName" },
      { header: "Prezime", key: "lastName" },
      { header: "Email", key: "email" },
      { header: "VAT", key: "vat" },
      { header: "Brand ime", key: "brandName" },
      { header: "Legalno ime", key: "legalName" },
    ];
    for (const user of withoutApplications) {
      const u = omit(
        [
          "companies",
        ],
        user,
      );
      const [ company ] = user.companies;

      worksheet.addRow({
        ...u,
        ...omit(
          [
            "applications",
          ],
          company,
        ),
      });
    }
  }

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition("korisnici.xlsx"))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
