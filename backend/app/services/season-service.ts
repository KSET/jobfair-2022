import type {
  Prisma,
} from "@prisma/client";
import {
  type prisma,
} from "../providers/prisma";


type PrismaClient = typeof prisma;

export const getCurrentSeasonId = async (
  prisma: Pick<PrismaClient, "season">,
): Promise<number | null> => {
  const now = new Date();
  const currentSeason = await prisma.season.findFirst({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    select: { id: true },
  });
  return currentSeason?.id ?? null;
};

type CompanySelectWithApplications = Prisma.CompanySelect & {
  applications?: Prisma.CompanySelect["applications"],
};

export const scopeCompanyApplicationsToSeason = <T extends CompanySelectWithApplications>(
  select: T,
  seasonId: number,
): T => {
  if (select.applications) {
    const applications = select.applications as Exclude<typeof select.applications, boolean>;
    applications.where = {
      forSeasonId: seasonId,
    };
  }
  return select;
};
