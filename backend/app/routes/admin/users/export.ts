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
        },
      },
    },
  });

  const withoutCompanies = users.filter(({ companies }) => 0 === companies.length);
  const inCompanies = users.filter(({ companies }) => 0 < companies.length);

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
    const worksheet = workbook.addWorksheet("Korisnici u firmama");
    worksheet.columns = [
      { header: "Ime", key: "firstName" },
      { header: "Prezime", key: "lastName" },
      { header: "Email", key: "email" },
      { header: "VAT", key: "vat" },
      { header: "Brand ime", key: "brandName" },
      { header: "Legalno ime", key: "legalName" },
    ];
    for (const user of inCompanies) {
      worksheet.addRow({
        ...omit(
          [
            "companies",
          ],
          user,
        ),
        ...user.companies[0],
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
