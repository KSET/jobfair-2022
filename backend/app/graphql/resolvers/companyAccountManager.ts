import {
  Arg,
  Ctx,
  FieldResolver,
  Info,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  Company,
  CompanyAccountManager,
  Season,
  User,
} from "@generated/type-graphql";
import type {
  GraphQLResolveInfo,
} from "graphql";
import type {
  Prisma,
} from "@prisma/client";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import type {
  Dict,
  GQLResponse,
} from "../../types/helpers";
import type {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  approvedApplicationWhere,
  isAccountManager,
  isCompanyApprovedForSeason,
  seasonWhereFor,
} from "../../helpers/company-access";
import {
  EventsService,
} from "../../services/events-service";
import {
  transformSelect as transformSelectUser,
} from "./user";
import {
  transformSelect as transformSelectCompany,
} from "./company";
import {
  transformSelect as transformSelectSeason,
} from "./season";

@Resolver(() => CompanyAccountManager)
export class CompanyAccountManagerFieldResolver {
  @FieldResolver(() => User)
  user(
    @Root() link: CompanyAccountManager,
  ): User | null {
    return link.user || null;
  }

  @FieldResolver(() => Company)
  company(
    @Root() link: CompanyAccountManager,
  ): Company | null {
    return link.company || null;
  }

  @FieldResolver(() => Season)
  season(
    @Root() link: CompanyAccountManager,
  ): Season | null {
    return link.season || null;
  }
}

export const transformSelect = transformSelectFor<CompanyAccountManagerFieldResolver>({
  user(select) {
    select.user = {
      select: transformSelectUser(select.user as Dict),
    };

    return select;
  },

  company(select) {
    select.company = {
      select: transformSelectCompany(select.company as Dict),
    };

    return select;
  },

  season(select) {
    select.season = {
      select: transformSelectSeason(select.season as Dict),
    };

    return select;
  },
});

@Resolver(() => CompanyAccountManager)
export class CompanyAccountManagerResolver {
  @Query(() => [ CompanyAccountManager ])
  async companyAccountManagers(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("season", () => String, { nullable: true }) seasonUid: string | null | undefined,
  ): GQLResponse<CompanyAccountManager[]> {
    const { user } = ctx;

    if (!user) {
      return [];
    }

    const isAdmin = hasAtLeastRole(Role.Admin, user);

    if (!isAdmin && !isAccountManager(user)) {
      return [];
    }

    const where: Prisma.CompanyAccountManagerWhereInput = {
      season: seasonWhereFor(seasonUid),
    };

    if (!isAdmin) {
      where.userId = user.id;
    }

    const select = toSelect<Prisma.CompanyAccountManagerSelect>(info, transformSelect);

    const companySelect = select.company as { select?: Prisma.CompanySelect, } | undefined;
    const hideMembers = !isAdmin && Boolean(companySelect?.select?.members);

    if (hideMembers && companySelect?.select) {
      delete companySelect.select.members;
      companySelect.select.uid = true;
    }

    if (!isAdmin) {
      select.companyId = true;
      select.seasonId = true;
    }

    const links = await ctx.prisma.companyAccountManager.findMany({
      where,
      select,
      orderBy: [
        {
          company: {
            brandName: "asc",
          },
        },
        {
          createdAt: "asc",
        },
      ],
    }) as (CompanyAccountManager & { companyId?: number, seasonId?: number, })[];

    if (hideMembers) {
      for (const link of links) {
        if (link.company) {
          link.company.members = [];
        }
      }
    }

    if (isAdmin || 0 === links.length) {
      return links;
    }

    const approved = await ctx.prisma.companyApplication.findMany({
      where: {
        OR: links.map((link) => ({
          forCompanyId: link.companyId,
          forSeasonId: link.seasonId,
        })),
        approval: approvedApplicationWhere,
      },
      select: {
        forCompanyId: true,
        forSeasonId: true,
      },
    });

    const approvedKeys = new Set(approved.map((application) => `${ application.forCompanyId }:${ application.forSeasonId }`));

    return links.filter((link) => approvedKeys.has(`${ link.companyId }:${ link.seasonId }`));
  }

  @Query(() => [ User ])
  accountManagerUsers(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return ctx.prisma.user.findMany({
      where: {
        roles: {
          some: {
            name: Role.AccountManager,
          },
        },
      },
      select: toSelect(info, transformSelectUser),
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
    });
  }

  @Mutation(() => [ CompanyAccountManager ], { nullable: true })
  async setCompanyAccountManagers(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("season", () => String) seasonUid: string,
      @Arg("company", () => String) companyUid: string,
      @Arg("users", () => [ String ]) userUids: string[],
  ): GQLResponse<CompanyAccountManager[], "nullable"> {
    if (!ctx.user || !hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const [
      season,
      company,
    ] = await Promise.all([
      ctx.prisma.season.findUnique({
        where: {
          uid: seasonUid,
        },
        select: {
          id: true,
          uid: true,
        },
      }),
      ctx.prisma.company.findUnique({
        where: {
          uid: companyUid,
        },
        select: {
          id: true,
          uid: true,
        },
      }),
    ]);

    if (!season || !company) {
      return null;
    }

    const uniqueUserUids = Array.from(new Set(userUids));

    if (0 < uniqueUserUids.length && !await isCompanyApprovedForSeason(ctx.prisma, company.id, seasonWhereFor(season.uid))) {
      return null;
    }

    const users = await ctx.prisma.user.findMany({
      where: {
        uid: {
          in: uniqueUserUids,
        },
        roles: {
          some: {
            name: Role.AccountManager,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length !== uniqueUserUids.length) {
      return null;
    }

    await ctx.prisma.$transaction(async (prisma) => {
      await prisma.companyAccountManager.deleteMany({
        where: {
          companyId: company.id,
          seasonId: season.id,
        },
      });

      if (0 < users.length) {
        await prisma.companyAccountManager.createMany({
          data: users.map((user) => ({
            userId: user.id,
            companyId: company.id,
            seasonId: season.id,
          })),
        });
      }
    });

    const links = await ctx.prisma.companyAccountManager.findMany({
      where: {
        companyId: company.id,
        seasonId: season.id,
      },
      select: toSelect<Prisma.CompanyAccountManagerSelect>(info, transformSelect),
      orderBy: {
        createdAt: "asc",
      },
    });

    void EventsService.logEvent("company:account-managers:set", ctx.user.id, {
      season: season.uid,
      company: company.uid,
      users: uniqueUserUids,
    });

    return links as CompanyAccountManager[];
  }

  @Mutation(() => Int)
  async deleteCompanyAccountManagersForSeason(
    @Ctx() ctx: Context,
      @Arg("season", () => String) seasonUid: string,
  ): GQLResponse<number> {
    if (!ctx.user || !hasAtLeastRole(Role.Admin, ctx.user)) {
      return 0;
    }

    const { count } = await ctx.prisma.companyAccountManager.deleteMany({
      where: {
        season: {
          uid: seasonUid,
        },
      },
    });

    void EventsService.logEvent("company:account-managers:delete-for-season", ctx.user.id, {
      season: seasonUid,
      count,
    });

    return count;
  }
}
