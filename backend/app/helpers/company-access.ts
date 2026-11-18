import type {
  Prisma,
} from "@prisma/client";
import type {
  SessionUser,
} from "../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "./auth";

export type CompanyAccessVia = "admin" | "member" | "account-manager";

export type CompanyAccess = {
  company: {
    id: number,
    uid: string,
    vat: string,
    brandName: string,
  },
  via: CompanyAccessVia,
};

export type CompanyAccessOptions = {
  seasonUid?: string | null,
  allowAccountManager?: boolean,
  requireApproved?: boolean,
  allowMember?: boolean,
};

export const isAccountManager =
  (user?: SessionUser | null): user is SessionUser =>
    Boolean(user?.roles.includes(Role.AccountManager))
;

export const currentSeasonWhere =
  (): Prisma.SeasonWhereInput => {
    const now = new Date();

    return {
      startsAt: {
        lte: now,
      },
      endsAt: {
        gte: now,
      },
    };
  }
;

export const seasonWhereFor =
  (seasonUid?: string | null): Prisma.SeasonWhereInput =>
    seasonUid
      ? {
        uid: seasonUid,
      }
      : currentSeasonWhere()
;

export const approvedApplicationWhere: Prisma.CompanyApplicationApprovalWhereInput = {
  OR: [
    {
      booth: true,
    },
    {
      panel: true,
    },
    {
      cocktail: true,
    },
    {
      talkParticipants: {
        gt: 0,
      },
    },
    {
      workshopParticipants: {
        gt: 0,
      },
    },
    {
      fusionParticipants: {
        gt: 0,
      },
    },
  ],
};

export const isCompanyApprovedForSeason =
  async (
    prisma: Prisma.TransactionClient,
    companyId: number,
    seasonWhere: Prisma.SeasonWhereInput,
  ): Promise<boolean> => {
    const application = await prisma.companyApplication.findFirst({
      where: {
        forCompanyId: companyId,
        forSeason: seasonWhere,
        approval: approvedApplicationWhere,
      },
      select: {
        id: true,
      },
    });

    return Boolean(application);
  }
;

const ACCOUNT_MANAGER_MEMBER_FIELDS = [
  "uid",
  "firstName",
  "lastName",
  "email",
] as const;

export const restrictMembersSelectForAccountManager =
  (select: Prisma.CompanySelect) => {
    if (!select.members) {
      return;
    }

    const requested =
      "object" === typeof select.members
        ? (select.members.select ?? {}) as Record<string, unknown>
        : {}
    ;

    select.members = {
      select: {
        uid: true,
        ...Object.fromEntries(
          ACCOUNT_MANAGER_MEMBER_FIELDS
            .filter((field) => requested[field])
            .map((field) => [ field, true ]),
        ),
      },
    };
  }
;

export const canActForCompany =
  async (
    prisma: Prisma.TransactionClient,
    user: SessionUser | null | undefined,
    companyRef: { vat?: string | null, uid?: string | null, },
    options: CompanyAccessOptions = {},
  ): Promise<CompanyAccess | null> => {
    if (!user) {
      return null;
    }

    const vat = companyRef.vat?.trim().toUpperCase();
    const uid = companyRef.uid?.trim();

    if (!vat && !uid) {
      return null;
    }

    const company = await prisma.company.findUnique({
      where:
        vat
          ? {
            vat,
          }
          : {
            uid: uid!,
          },
      select: {
        id: true,
        uid: true,
        vat: true,
        brandName: true,
      },
    });

    if (!company) {
      return null;
    }

    if (hasAtLeastRole(Role.Admin, user)) {
      return {
        company,
        via: "admin",
      };
    }

    if (
      false !== options.allowMember
      && user.companies.some((userCompany) => userCompany.id === company.id)
    ) {
      return {
        company,
        via: "member",
      };
    }

    if (!options.allowAccountManager || !isAccountManager(user)) {
      return null;
    }

    const seasonWhere = seasonWhereFor(options.seasonUid);

    const assignment = await prisma.companyAccountManager.findFirst({
      where: {
        userId: user.id,
        companyId: company.id,
        season:
          options.requireApproved
            ? {
              AND: [
                seasonWhere,
                {
                  companies: {
                    some: {
                      forCompanyId: company.id,
                      approval: approvedApplicationWhere,
                    },
                  },
                },
              ],
            }
            : seasonWhere,
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      return null;
    }

    return {
      company,
      via: "account-manager",
    };
  }
;

export const companyAccessForMemberEdit =
  (
    prisma: Prisma.TransactionClient,
    user: SessionUser,
    vat?: string | null,
  ): Promise<CompanyAccess | null> => {
    if (vat) {
      return canActForCompany(prisma, user, { vat }, { allowAccountManager: true, requireApproved: true });
    }

    const [ company ] = user.companies;

    if (!company) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      company: {
        id: company.id,
        uid: company.uid,
        vat: company.vat,
        brandName: company.brandName,
      },
      via: "member",
    });
  }
;
