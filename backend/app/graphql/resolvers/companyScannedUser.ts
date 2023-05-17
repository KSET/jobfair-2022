import {
  User,
  CompanyScannedUser,
} from "@generated/type-graphql";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Prisma,
} from "@prisma/client";
import {
  Dict,
  GQLField, GQLResponse,
} from "../../types/helpers";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Role, hasAtLeastRole,
} from "../../helpers/auth";
import {
  Context,
} from "../../types/apollo-context";
import {
  transformSelect as transformSelectUser,
} from "./user";

@Resolver(() => CompanyScannedUser)
export class CompanyScannedUserFieldResolver {
  @FieldResolver((_type) => User, { nullable: true })
  user(
    @Root() scan: CompanyScannedUser,
  ): GQLField<User, "nullable"> {
    return scan.user;
  }
}

export const transformSelect = transformSelectFor<CompanyScannedUserFieldResolver>({
  user(select) {
    select.user = {
      select: transformSelectUser(select.user as never),
    };

    return select;
  },
});


@InputType()
class CompanyScanUserQrRefineData {
  @Field(() => String, { nullable: true })
    note?: string | null = undefined;

  @Field(() => Boolean, { nullable: true })
    isStarred?: boolean = undefined;
}

@ObjectType()
class CompanyScanUserQrResponse {
  @Field(() => User, { nullable: true })
    user: User | null = null;

  @Field(() => String, { nullable: true })
    note?: string | null = undefined;

  @Field(() => Boolean, { nullable: true })
    isStarred?: boolean = undefined;

  @Field(() => Boolean)
    alreadyScanned: boolean = false;

  @Field(() => String, { nullable: true })
    error: string | null = null;
}

@Resolver(() => CompanyScannedUser)
export class CompanyUserQrScanResolver {
  @Mutation(() => CompanyScanUserQrResponse, { nullable: true })
  async scanUserQr(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("userUid", () => String) userUid: string,
  ): GQLResponse<CompanyScanUserQrResponse, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const [ company ] = ctx.user.companies;

    if (!company && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return {
        error: "You can not scan the user",
      };
    }

    const selectRaw = toSelect(gqlInfo, (x) => x);
    const select = transformSelectUser(selectRaw.user as Dict);

    const user = await ctx.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
      select: {
        ...select,
        id: true,
      },
    });

    if (!user) {
      return {
        error: "User not found",
      };
    }

    const currentSeason = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!currentSeason) {
      return {
        error: "No active season found",
      };
    }

    const scanMeta = await ctx.prisma.companyScannedUser.findFirst({
      where: {
        userId: user.id,
        seasonId: currentSeason.id,
        company: {
          uid: company.uid,
        },
      },
    });

    if (!scanMeta) {
      await ctx.prisma.companyScannedUser.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
          company: {
            connect: {
              uid: company.uid,
            },
          },
          season: {
            connect: {
              id: currentSeason.id,
            },
          },
        },
      });
    }

    return {
      user: user as never,
      isStarred: Boolean(scanMeta?.isStarred),
      alreadyScanned: Boolean(scanMeta),
      note: scanMeta?.note ?? undefined,
    };
  }

  @Mutation(() => CompanyScanUserQrResponse, { nullable: true })
  async scanUserQrRefine(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("userUid", () => String) userUid: string,
      @Arg("refineData", () => CompanyScanUserQrRefineData) refineData: CompanyScanUserQrRefineData,
  ): GQLResponse<CompanyScanUserQrResponse, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const [ company ] = ctx.user.companies;

    if (!company && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return {
        error: "You can not scan the user",
      };
    }

    const selectRaw = toSelect(gqlInfo, (x) => x);
    const select = transformSelectUser(selectRaw.user as Dict);

    const user = await ctx.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
      select: {
        ...select,
        id: true,
      },
    });

    if (!user) {
      return {
        error: "User not found",
      };
    }

    const currentSeason = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!currentSeason) {
      return {
        error: "No active season found",
      };
    }

    const oldScanMeta = await ctx.prisma.companyScannedUser.findFirst({
      where: {
        userId: user.id,
        seasonId: currentSeason.id,
        company: {
          uid: company.uid,
        },
      },
    });

    const scanMeta = await ctx.prisma.companyScannedUser.upsert({
      create: {
        user: {
          connect: {
            id: user.id,
          },
        },
        company: {
          connect: {
            uid: company.uid,
          },
        },
        season: {
          connect: {
            id: currentSeason.id,
          },
        },
        note: refineData.note,
        isStarred: refineData.isStarred,
      },
      update: {
        note: refineData.note,
        isStarred: refineData.isStarred,
      },
      where: {
        id: oldScanMeta?.id,
      },
    });

    return {
      user: user as never,
      isStarred: Boolean(scanMeta?.isStarred),
      note: scanMeta?.note ?? undefined,
    };
  }

  @Query(() => [ CompanyScannedUser ])
  scannedUsers(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("companyUid", () => String, { nullable: true }) companyUidQueryParam?: string | null,
      @Arg("seasonUid", () => String, { nullable: true }) seasonUid?: string | null,
  ): GQLResponse<CompanyScannedUser[]> {
    if (!ctx.user) {
      return Promise.resolve([]);
    }

    const companyUid =
      (
        hasAtLeastRole(Role.Admin, ctx.user)
        && companyUidQueryParam
      )
        ? companyUidQueryParam
        : (ctx.user.companies || []).at(0)?.uid
      ;

    if (!companyUid) {
      return Promise.resolve([]);
    }

    const seasonWhere: Prisma.SeasonWhereInput =
      seasonUid
        ? {
          uid: seasonUid,
        }
        : {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        }
      ;

    return ctx.prisma.companyScannedUser.findMany({
      where: {
        season: seasonWhere,
        company: {
          uid: companyUid,
        },
      },
      select: toSelect(gqlInfo, transformSelect),
      orderBy: {
        scannedAt: "desc",
      },
    });
  }
}
