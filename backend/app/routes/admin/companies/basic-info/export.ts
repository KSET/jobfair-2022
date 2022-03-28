import {
  countries,
} from "jsvat";
import ExcelJS from "exceljs";
import contentDisposition from "content-disposition";
import {
  AuthRouter,
} from "../../../../helpers/route";
import {
  Role,
} from "../../../../helpers/auth";
import {
  prisma,
} from "../../../../providers/prisma";

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", async (req, res) => {
  const companies = await prisma.company.findMany({
    select: {
      vat: true,
      brandName: true,
      legalName: true,
      address: true,
    },
    orderBy: {
      legalName: "asc",
    },
  });

  const companiesWithCountries = companies.map((c) => ({
    ...c,
    country: countries.find((country) => country.rules.regex.some((re) => re.test(c.vat)))?.name,
    street: c.address.split(",").shift(),
    zip: c.address.split(",").slice(1).find((x) => /^\d{2,} /i.test(x.trim()))?.trim(),
  }));

  const workbook = new ExcelJS.Workbook();

  {
    const worksheet = workbook.addWorksheet("Firme");

    worksheet.columns = [
      { header: "Pravni naziv", key: "legalName" },
      { header: "Brend naziv", key: "brandName" },
      { header: "VAT", key: "vat" },
      { header: "Adresa (puna)", key: "address" },
      { header: "Država", key: "country" },
      { header: "Ulica", key: "street" },
      { header: "Poštanski broj", key: "zip" },
    ];

    for (const company of companiesWithCountries) {
      worksheet.addRow(company);
    }
  }

  res
    .header("content-type", "application/vnd.ms-excel")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition("firme.xlsx"))
  ;

  try {
    await workbook.xlsx.write(res);
  } catch {
  }

  return res.end();
});

export default router;
