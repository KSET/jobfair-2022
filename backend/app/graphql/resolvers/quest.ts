import {
  Company,
  User,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Info,
  Int,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import type {
  Prisma,
} from "@prisma/client";
import {
  Context,
} from "../../types/apollo-context";
import {
  toSelect,
} from "../helpers/resolver";
import {
  listQuestApplicants,
  listQuestCompanies,
} from "../../services/quest-service";
import {
  getCurrentSeasonId,
  scopeCompanyApplicationsToSeason,
} from "../../services/season-service";
import {
  Role,
} from "../../helpers/auth";
import {
  transformSelect as transformSelectCompanies,
} from "./company";

@ObjectType()
export class QuestApplicantEntry {
  @Field(() => User)
    user!: User;

  @Field(() => Int)
    points!: number;

  @Field(() => Date)
    scannedAt!: Date;
}

@ObjectType()
export class QuestCompanyStats {
  @Field(() => Company)
    company!: Company;

  @Field(() => Int)
    applicantCount!: number;
}

@Resolver(() => Company)
export class QuestResolver {
  @Authorized()
  @Query(() => [ Company ])
  async questCompanies(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("seasonUid", () => String, { nullable: true })
      seasonUid: string | null = null,
  ): Promise<Company[]> {
    let seasonId: number | null;

    if (seasonUid) {
      const season = await ctx.prisma.season.findUnique({
        where: { uid: seasonUid },
        select: { id: true },
      });
      seasonId = season?.id ?? null;
    } else {
      seasonId = await getCurrentSeasonId(ctx.prisma);
    }

    if (null === seasonId) {
      return [];
    }

    const select = toSelect<Prisma.CompanySelect>(info, transformSelectCompanies);

    select.id = true;

    scopeCompanyApplicationsToSeason(select, seasonId);

    return listQuestCompanies(ctx.prisma, seasonId, select) as unknown as Promise<Company[]>;
  }

  @Authorized(Role.Admin)
  @Query(() => [ QuestApplicantEntry ])
  async questApplicants(
    @Ctx() ctx: Context,
      @Arg("seasonUid", () => String)
      seasonUid: string,
      @Arg("companyUid", () => String)
      companyUid: string,
  ): Promise<QuestApplicantEntry[]> {
    const season = await ctx.prisma.season.findUnique({
      where: { uid: seasonUid },
      select: { id: true },
    });

    if (!season) {
      return [];
    }

    const company = await ctx.prisma.company.findUnique({
      where: { uid: companyUid },
      select: { id: true },
    });

    if (!company) {
      return [];
    }

    const applicants = await listQuestApplicants(ctx.prisma, company.id, season.id);

    if (0 === applicants.length) {
      return [];
    }

    const applicantUserIds = applicants.map((a) => a.userId);

    const users = await ctx.prisma.user.findMany({
      where: { id: { in: applicantUserIds } },
      select: {
        id: true,
        uid: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    const usersById = new Map(users.map((u) => [ u.id, u ]));

    return applicants
      .map((a) => {
        const user = usersById.get(a.userId);
        if (!user) {
          return null;
        }
        return {
          user: user as unknown as User,
          points: a.points,
          scannedAt: a.scannedAt,
        };
      })
      .filter((entry): entry is QuestApplicantEntry => null !== entry)
    ;
  }

  @Authorized(Role.Admin)
  @Query(() => [ QuestCompanyStats ])
  async questCompaniesWithStats(
    @Ctx() ctx: Context,
      @Arg("seasonUid", () => String)
      seasonUid: string,
  ): Promise<QuestCompanyStats[]> {
    const season = await ctx.prisma.season.findUnique({
      where: { uid: seasonUid },
      select: { id: true },
    });

    if (!season) {
      return [];
    }

    const companies = await listQuestCompanies(ctx.prisma, season.id, {
      id: true,
      uid: true,
      brandName: true,
    });

    if (0 === companies.length) {
      return [];
    }

    const companyIds = companies.map((c) => c.id as number);

    const counts = await ctx.prisma.companyScannedUser.groupBy({
      by: [ "companyId" ],
      where: {
        seasonId: season.id,
        questEntered: true,
        companyId: { in: companyIds },
      },
      _count: { userId: true },
    });

    const countByCompanyId = new Map(
      counts.map((row) => [ row.companyId, row._count.userId ]),
    );

    return companies.map((c) => ({
      company: c as unknown as Company,
      applicantCount: countByCompanyId.get(c.id as number) ?? 0,
    }));
  }
}
