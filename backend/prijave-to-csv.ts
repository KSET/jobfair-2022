/* eslint-disable no-console */

import {
  prisma,
} from "./app/providers/prisma";

async function main() {
  const currentSeason = await prisma.season.findFirst({
    orderBy: {
      id: "desc",
    },
  });

  if (!currentSeason) {
    throw new Error("No current season");
  }

  const logsRaw = await prisma.eventLog.findMany({
    where: {
      AND: {
        name: "company-application:create",
        date: {
          lte: currentSeason.endsAt,
          gte: currentSeason.startsAt,
        },
      },
    },
    include: {
      user: true,
    },
  });
  const logs = logsRaw.map(({ data, ...log }) => ({
    data: JSON.parse(data ?? "{}") as Record<string, unknown>,
    ...log,
  }));

  const companyVats = Array.from(
    new Set(
      logs
        .map(({ data }) => data.vat as string)
        .filter(Boolean),
    ),
  );

  const companyList = await prisma.company.findMany({
    where: {
      vat: {
        in: companyVats,
      },
    },
  });
  const vatToCompany = new Map(
    companyList.map((company) => [ company.vat, company ]),
  );

  const logsWithCompany =
    logs
      .map((x) => ({
        ...x,
        company: vatToCompany.get(x.data.vat as string)!,
      }))
      .filter((x) => x.company)
  ;

  const csvEntries = logsWithCompany.map((x) => [
    x.company.brandName,
    x.company.vat,
    `${ x.user!.firstName } ${ x.user!.lastName }`,
    x.user!.email,
    x.date.toLocaleString("hr-HR"),
  ]);

  console.log(
    [ [ "Brand Name", "VAT", "Name", "Email", "Date" ], ...csvEntries ]
      .map(
        (line) =>
          line
            .map((x) => `"${ x.replaceAll("\"", "\"\"") }"`)
            .join(",")
        ,
      )
      .join("\n")
    ,
  );
}

void main()
  .catch(console.log)
  .then(() => prisma.$disconnect())
  .then(() => process.exit(0))
;
