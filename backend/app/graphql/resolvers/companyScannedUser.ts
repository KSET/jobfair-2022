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
  registerEnumType,
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
  getCurrentSeasonId,
} from "../../services/season-service";
import {
  isCompanyInQuest,
} from "../../services/quest-service";
import {
  transformSelect as transformSelectUser,
} from "./user";

export enum ScanFilter {
  Cv = "Cv",
  Quest = "Quest",
}

registerEnumType(ScanFilter, {
  name: "ScanFilter",
});

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

  @Field(() => Boolean, { nullable: true })
    cvSaved?: boolean = undefined;

  @Field(() => Boolean, { nullable: true })
    questEntered?: boolean = undefined;
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

  @Field(() => Boolean)
    cvSaved: boolean = true;

  @Field(() => Boolean)
    questEntered: boolean = false;

  @Field(() => Boolean)
    companyWantsQuest: boolean = false;

  @Field(() => Boolean)
    deleted: boolean = false;

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

    const currentSeasonId = await getCurrentSeasonId(ctx.prisma);

    if (null === currentSeasonId) {
      return {
        error: "No active season found",
      };
    }

    const companyWantsQuest = await isCompanyInQuest(ctx.prisma, company.uid, currentSeasonId);

    const scanMeta = await ctx.prisma.companyScannedUser.findFirst({
      where: {
        userId: user.id,
        seasonId: currentSeasonId,
        company: {
          uid: company.uid,
        },
      },
    });

    const createdScan = !scanMeta ? await ctx.prisma.companyScannedUser.create({
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
            id: currentSeasonId,
          },
        },
        cvSaved: true,
        questEntered: companyWantsQuest,
      },
    }) : null;

    const effectiveScan = (scanMeta ?? createdScan)!;

    return {
      user: user as never,
      isStarred: Boolean(effectiveScan.isStarred),
      alreadyScanned: Boolean(scanMeta),
      note: effectiveScan.note ?? undefined,
      cvSaved: effectiveScan.cvSaved,
      questEntered: effectiveScan.questEntered,
      companyWantsQuest,
      deleted: false,
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

    const currentSeasonId = await getCurrentSeasonId(ctx.prisma);

    if (null === currentSeasonId) {
      return {
        error: "No active season found",
      };
    }

    const companyWantsQuest = await isCompanyInQuest(ctx.prisma, company.uid, currentSeasonId);

    const oldScanMeta = await ctx.prisma.companyScannedUser.findFirst({
      where: {
        userId: user.id,
        seasonId: currentSeasonId,
        company: {
          uid: company.uid,
        },
      },
    });

    if (!oldScanMeta) {
      return {
        error: "Scan not found, must scan first",
      };
    }

    const finalCvSaved = refineData.cvSaved ?? oldScanMeta.cvSaved;
    const finalQuestEntered = refineData.questEntered ?? oldScanMeta.questEntered;

    if (false === finalCvSaved && false === finalQuestEntered) {
      await ctx.prisma.companyScannedUser.delete({
        where: { id: oldScanMeta.id },
      });
      return {
        user: user as never,
        isStarred: false,
        alreadyScanned: false,
        note: undefined,
        cvSaved: false,
        questEntered: false,
        companyWantsQuest,
        deleted: true,
      };
    }

    const scanMeta = await ctx.prisma.companyScannedUser.update({
      where: { id: oldScanMeta.id },
      data: {
        note: refineData.note ?? undefined,
        isStarred: refineData.isStarred ?? undefined,
        cvSaved: refineData.cvSaved ?? undefined,
        questEntered: refineData.questEntered ?? undefined,
      },
    });

    return {
      user: user as never,
      isStarred: Boolean(scanMeta.isStarred),
      alreadyScanned: true,
      note: scanMeta.note ?? undefined,
      cvSaved: scanMeta.cvSaved,
      questEntered: scanMeta.questEntered,
      companyWantsQuest,
      deleted: false,
    };
  }

  @Query(() => [ CompanyScannedUser ])
  scannedUsers(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("companyUid", () => String, { nullable: true }) companyUidQueryParam?: string | null,
      @Arg("seasonUid", () => String, { nullable: true }) seasonUid?: string | null,
      @Arg("filter", () => ScanFilter, { nullable: true }) filter?: ScanFilter | null,
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

    const filterWhere: Prisma.CompanyScannedUserWhereInput =
      ScanFilter.Quest === filter ? { questEntered: true }
      : ScanFilter.Cv === filter ? { cvSaved: true }
      : { cvSaved: true };

    return ctx.prisma.companyScannedUser.findMany({
      where: {
        season: seasonWhere,
        company: {
          uid: companyUid,
        },
        ...filterWhere,
      },
      select: toSelect(gqlInfo, transformSelect),
      orderBy: {
        scannedAt: "desc",
      },
    });
  }

  @Query(() => Boolean)
  async companyWantsQuest(
    @Ctx() ctx: Context,
      @Arg("companyUid", () => String, { nullable: true }) companyUidQueryParam?: string | null,
      @Arg("seasonUid", () => String, { nullable: true }) seasonUid?: string | null,
  ): Promise<boolean> {
    if (!ctx.user) {
      return false;
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
      return false;
    }

    let seasonId: number | null;
    if (seasonUid) {
      const season = await ctx.prisma.season.findFirst({
        where: { uid: seasonUid },
        select: { id: true },
      });
      seasonId = season?.id ?? null;
    } else {
      seasonId = await getCurrentSeasonId(ctx.prisma);
    }

    if (null === seasonId) {
      return false;
    }

    return isCompanyInQuest(ctx.prisma, companyUid, seasonId);
  }
}
