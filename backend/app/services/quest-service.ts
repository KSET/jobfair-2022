import type {
  Prisma,
} from "@prisma/client";
import {
  type prisma,
} from "../providers/prisma";


type PrismaClient = typeof prisma;

export const QUEST_POINTS_PER_EVENT_TYPE: Record<string, number> = {
  talk: 200,
  workshop: 600,
  panel: 400,
  fusion: 400,
  "hot-talk": 400,
  debate: 400,
};

export const LINKEDIN_PHOTOSHOOT_BRAND_NAME = "FOTO STUDIO";
export const LINKEDIN_PHOTOSHOOT_POINTS = 100;

const OTHER_CONTENT_SUBTYPES = [ "hot-talk", "debate", "loosen-up", "other" ] as const;

export type QuestScanRow = {
  eventType: string,
  eventId: number,
  eventName: string,
  points: number,
  firstScannedAt: Date,
};

type Aggregate = {
  eventType: string,
  eventId: number,
  firstScannedAt: Date,
};

const pointsFor = (eventType: string): number =>
  QUEST_POINTS_PER_EVENT_TYPE[eventType] ?? 0
;

const aggregateLogs = async (
  prisma: Pick<PrismaClient, "gateGuardianLog">,
  userId: number,
  seasonId: number,
): Promise<Aggregate[]> => {
  const logs = await prisma.gateGuardianLog.findMany({
    where: {
      forUserId: userId,
      forSeasonId: seasonId,
      // eventId=0 is the "ulaz" gate-entry sentinel — no corresponding entity row to resolve.
      eventId: { not: 0 },
    },
    select: {
      eventType: true,
      eventId: true,
      scannedAt: true,
    },
  });

  const byKey = new Map<string, Aggregate>();

  for (const log of logs) {
    const key = `${ log.eventType }|${ log.eventId }`;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, {
        eventType: log.eventType,
        eventId: log.eventId,
        firstScannedAt: log.scannedAt,
      });
      continue;
    }

    if (log.scannedAt < existing.firstScannedAt) {
      existing.firstScannedAt = log.scannedAt;
    }
  }

  return Array.from(byKey.values());
};

type EventNameModels = Pick<PrismaClient, "applicationTalk" | "applicationWorkshop" | "companyPanel" | "applicationFusion" | "otherContent">;

const resolveEventNames = async (
  prisma: EventNameModels,
  aggregates: Aggregate[],
): Promise<Map<string, string>> => {
  const idsByType = new Map<string, number[]>();

  for (const aggregate of aggregates) {
    const list = idsByType.get(aggregate.eventType);
    if (list) {
      list.push(aggregate.eventId);
    } else {
      idsByType.set(aggregate.eventType, [ aggregate.eventId ]);
    }
  }

  const nameMap = new Map<string, string>();
  const setName = (eventType: string, id: number, name: string) => {
    nameMap.set(`${ eventType }|${ id }`, name);
  };

  const talkIds = idsByType.get("talk");
  if (talkIds?.length) {
    const talks = await prisma.applicationTalk.findMany({
      where: { id: { in: talkIds } },
      select: { id: true, titleHr: true, titleEn: true },
    });
    for (const t of talks) {
      setName("talk", t.id, t.titleHr || t.titleEn || `#${ t.id }`);
    }
  }

  const workshopIds = idsByType.get("workshop");
  if (workshopIds?.length) {
    const workshops = await prisma.applicationWorkshop.findMany({
      where: { id: { in: workshopIds } },
      select: { id: true, titleHr: true, titleEn: true },
    });
    for (const w of workshops) {
      setName("workshop", w.id, w.titleHr || w.titleEn || `#${ w.id }`);
    }
  }

  const panelIds = idsByType.get("panel");
  if (panelIds?.length) {
    const panels = await prisma.companyPanel.findMany({
      where: { id: { in: panelIds } },
      select: { id: true, name: true },
    });
    for (const p of panels) {
      setName("panel", p.id, p.name || `#${ p.id }`);
    }
  }

  const fusionIds = idsByType.get("fusion");
  if (fusionIds?.length) {
    const fusions = await prisma.applicationFusion.findMany({
      where: { id: { in: fusionIds } },
      select: { id: true, titleHr: true, titleEn: true },
    });
    for (const f of fusions) {
      setName("fusion", f.id, f.titleHr || f.titleEn || `#${ f.id }`);
    }
  }

  const otherContentSubtypeSet = new Set<string>(OTHER_CONTENT_SUBTYPES);
  const otherIds: number[] = [];
  for (const subtype of OTHER_CONTENT_SUBTYPES) {
    const ids = idsByType.get(subtype);
    if (ids?.length) {
      otherIds.push(...ids);
    }
  }

  if (otherIds.length) {
    const others = await prisma.otherContent.findMany({
      where: { id: { in: otherIds } },
      select: { id: true, nameHr: true, nameEn: true },
    });
    const byId = new Map<number, string>();
    for (const o of others) {
      byId.set(o.id, o.nameHr || o.nameEn || `#${ o.id }`);
    }
    for (const aggregate of aggregates) {
      if (!otherContentSubtypeSet.has(aggregate.eventType)) {
        continue;
      }
      const name = byId.get(aggregate.eventId);
      if (undefined !== name) {
        setName(aggregate.eventType, aggregate.eventId, name);
      }
    }
  }

  return nameMap;
};

const getLinkedinPhotoshootPoints = async (
  prisma: Pick<PrismaClient, "companyScannedUser">,
  userId: number,
  seasonId: number,
): Promise<number> => {
  const scan = await prisma.companyScannedUser.findFirst({
    where: {
      userId,
      seasonId,
      company: { brandName: LINKEDIN_PHOTOSHOOT_BRAND_NAME },
    },
    select: { id: true },
  });
  return scan ? LINKEDIN_PHOTOSHOOT_POINTS : 0;
};

export const computeQuestPoints = async (
  prisma: Pick<PrismaClient, "gateGuardianLog" | "companyScannedUser">,
  userId: number,
  seasonId: number,
): Promise<number> => {
  const aggregates = await aggregateLogs(prisma, userId, seasonId);
  const eventPoints = aggregates.reduce((sum, a) => sum + pointsFor(a.eventType), 0);
  const linkedinPoints = await getLinkedinPhotoshootPoints(prisma, userId, seasonId);
  return eventPoints + linkedinPoints;
};

export const listQuestScans = async (
  prisma: Pick<PrismaClient, "gateGuardianLog" | "companyScannedUser"> & EventNameModels,
  userId: number,
  seasonId: number,
): Promise<QuestScanRow[]> => {
  const aggregates = await aggregateLogs(prisma, userId, seasonId);

  const linkedinScan = await prisma.companyScannedUser.findFirst({
    where: { userId, seasonId, company: { brandName: LINKEDIN_PHOTOSHOOT_BRAND_NAME } },
    select: { scannedAt: true },
  });

  if (0 === aggregates.length && !linkedinScan) {
    return [];
  }

  const nameMap = await resolveEventNames(prisma, aggregates);

  const result: QuestScanRow[] = aggregates.map((a) => ({
    eventType: a.eventType,
    eventId: a.eventId,
    eventName: nameMap.get(`${ a.eventType }|${ a.eventId }`) ?? "",
    points: pointsFor(a.eventType),
    firstScannedAt: a.firstScannedAt,
  }));

  if (linkedinScan) {
    result.push({
      eventType: "linkedin-photoshoot",
      eventId: 0,
      eventName: "LinkedIn Photoshoot",
      points: LINKEDIN_PHOTOSHOOT_POINTS,
      firstScannedAt: linkedinScan.scannedAt,
    });
  }

  result.sort((a, b) => a.firstScannedAt.getTime() - b.firstScannedAt.getTime());

  return result;
};

export const listQuestAppliedCompanyIds = async (
  prisma: Pick<PrismaClient, "companyScannedUser" | "company">,
  userId: number,
  seasonId: number,
): Promise<number[]> => {
  const scans = await prisma.companyScannedUser.findMany({
    where: { userId, seasonId, questEntered: true },
    select: { companyId: true },
  });

  const candidateIds = Array.from(new Set(scans.map((s) => s.companyId)));

  if (0 === candidateIds.length) {
    return [];
  }

  const approved = await prisma.company.findMany({
    where: {
      id: { in: candidateIds },
      applications: {
        some: {
          forSeasonId: seasonId,
          wantsQuest: true,
          approval: { quest: true },
        },
      },
    },
    select: { id: true },
  });

  return approved.map((c) => c.id);
};

export const listQuestAppliedCompanies = async (
  prisma: Pick<PrismaClient, "companyScannedUser" | "company">,
  userId: number,
  seasonId: number,
  select: Prisma.CompanySelect,
) => {
  const companyIds = await listQuestAppliedCompanyIds(prisma, userId, seasonId);

  if (0 === companyIds.length) {
    return [];
  }

  return prisma.company.findMany({
    where: { id: { in: companyIds } },
    select,
    orderBy: { brandName: "asc" },
  });
};

export const listQuestCompanies = (
  prisma: Pick<PrismaClient, "company">,
  seasonId: number,
  select: Prisma.CompanySelect,
) =>
  prisma.company.findMany({
    where: {
      applications: {
        some: {
          forSeasonId: seasonId,
          wantsQuest: true,
          approval: { quest: true },
        },
      },
    },
    select,
    orderBy: { brandName: "asc" },
  })
;

export const isCompanyInQuest = async (
  prisma: Pick<PrismaClient, "companyApplication">,
  companyUid: string,
  seasonId: number,
): Promise<boolean> => {
  const application = await prisma.companyApplication.findFirst({
    where: {
      forCompany: { uid: companyUid },
      forSeasonId: seasonId,
      wantsQuest: true,
      approval: { quest: true },
    },
    select: { id: true },
  });
  return Boolean(application);
};

export type QuestApplicant = {
  userId: number,
  points: number,
  scannedAt: Date,
};

export const listQuestApplicants = async (
  prisma: Pick<PrismaClient, "companyScannedUser" | "companyApplication" | "gateGuardianLog">,
  companyId: number,
  seasonId: number,
): Promise<QuestApplicant[]> => {
  const questApplicationCount = await prisma.companyApplication.count({
    where: {
      forCompanyId: companyId,
      forSeasonId: seasonId,
      wantsQuest: true,
      approval: { quest: true },
    },
  });

  if (0 === questApplicationCount) {
    return [];
  }

  const scans = await prisma.companyScannedUser.findMany({
    where: { companyId, seasonId, questEntered: true },
    select: { userId: true, scannedAt: true },
  });

  if (0 === scans.length) {
    return [];
  }

  const applicants = await Promise.all(scans.map(async (s) => ({
    userId: s.userId,
    points: await computeQuestPoints(prisma, s.userId, seasonId),
    scannedAt: s.scannedAt,
  })));

  applicants.sort((a, b) => b.points - a.points);

  return applicants;
};
