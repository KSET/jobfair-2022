import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Float,
  Info,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  UserCompanyComponentRating,
  Company,
  User,
  Season,
} from "@generated/type-graphql";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { transformSelect as transformSelectUser } from "./user";
import { transformSelect as transformSelectCompany } from "./company";
import { transformSelect as transformSelectSeason } from "./season";
import { Dict, GQLField, GQLResponse } from "../../types/helpers";
import { Context } from "../../types/apollo-context";
import { GraphQLResolveInfo } from "graphql";

@Resolver((_of) => UserCompanyComponentRating)
export class UserFieldResolver {
  @FieldResolver((_type) => Company)
  forCompany(@Root() root: UserCompanyComponentRating): GQLField<Company> {
    return root.forCompany!;
  }

  @FieldResolver((_type) => User)
  forUser(@Root() root: UserCompanyComponentRating): GQLField<User> {
    return root.forUser!;
  }

  @FieldResolver((_type) => Season)
  forSeason(@Root() root: UserCompanyComponentRating): GQLField<Season> {
    return root.forSeason!;
  }
}

export const transformSelect = transformSelectFor<UserFieldResolver>({
  forUser(select) {
    select.forUser = {
      select: transformSelectUser(select.forUser as Dict),
    };
    return select;
  },

  forCompany(select) {
    select.forCompany = {
      select: transformSelectCompany(select.forCompany as Dict),
    };
    return select;
  },

  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Dict),
    };
    return select;
  },
});

@ObjectType()
export class UserCompanyComponentRatingComponentAverage {
  @Field(() => String, { nullable: false })
  component: string = "";

  @Field(() => Float, { nullable: false })
  averageRating: number = 0;
}

@Resolver(() => UserCompanyComponentRating)
export class UserCompanyComponentRatingResolver {
  @Query(() => [UserCompanyComponentRating])
  async userCompanyComponentRatings(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("companyUid", () => String)
    companyUid: string,
    @Arg("seasonUid", () => String)
    seasonUid: string,
  ): GQLResponse<UserCompanyComponentRating[]> {
    if (!ctx.user) {
      return [];
    }

    const userId = ctx.user.id;

    return ctx.prisma.userCompanyComponentRating.findMany({
      where: {
        forUserId: userId,
        forCompany: {
          uid: companyUid,
        },
        forSeason: {
          uid: seasonUid,
        },
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Query(() => UserCompanyComponentRating, { nullable: true })
  async userCompanyComponentRating(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("companyUid", () => String)
    companyUid: string,
    @Arg("seasonUid", () => String)
    seasonUid: string,
    @Arg("component", () => String)
    component: string,
  ): GQLResponse<UserCompanyComponentRating, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const userId = ctx.user.id;

    return ctx.prisma.userCompanyComponentRating.findFirst({
      where: {
        forUserId: userId,
        forCompany: {
          uid: companyUid,
        },
        forSeason: {
          uid: seasonUid,
        },
        component,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Query(() => [UserCompanyComponentRatingComponentAverage])
  async companyComponentAverageRatings(
    @Ctx() ctx: Context,
    @Arg("seasonUid", () => String)
    seasonUid: string,
  ): GQLResponse<UserCompanyComponentRatingComponentAverage[]> {
    if (!ctx.user) {
      return [];
    }

    const [userCompany] = ctx.user.companies;
    if (!userCompany) {
      return [];
    }

    const averages =
      await ctx.prisma.userCompanyComponentRatingAveragesView.findMany({
        where: {
          forCompanyId: userCompany.id,
          forSeason: {
            uid: seasonUid,
          },
        },
        select: {
          component: true,
          ratingAvg: true,
        },
      });

    return averages.map((a) => ({
      component: a.component,
      averageRating: a.ratingAvg,
    }));
  }

  @Mutation(() => UserCompanyComponentRating)
  async upsertUserCompanyComponentRating(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("companyUid", () => String)
    companyUid: string,
    @Arg("seasonUid", () => String)
    seasonUid: string,
    @Arg("component", () => String)
    component: string,
    @Arg("rating", () => Int)
    rating: number,
    @Arg("comment", () => String, { nullable: true })
    comment: string | null = null,
  ): GQLResponse<UserCompanyComponentRating, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const userId = ctx.user.id;
    rating = Math.max(0, Math.min(7, rating));

    comment = comment?.trim().slice(0, 2048) ?? null;

    const oldRating = await ctx.prisma.userCompanyComponentRating.findFirst({
      where: {
        forUserId: userId,
        forCompany: {
          uid: companyUid,
        },
        forSeason: {
          uid: seasonUid,
        },
        component,
      },
      select: {
        id: true,
      },
    });

    if (!oldRating) {
      return ctx.prisma.userCompanyComponentRating.create({
        data: {
          component,
          rating,
          comment,
          forUser: {
            connect: {
              id: userId,
            },
          },
          forCompany: {
            connect: {
              uid: companyUid,
            },
          },
          forSeason: {
            connect: {
              uid: seasonUid,
            },
          },
        },
        select: toSelect(gqlInfo, transformSelect),
      });
    }

    return ctx.prisma.userCompanyComponentRating.update({
      data: {
        rating,
        comment,
      },
      where: {
        id: oldRating.id,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Mutation(() => Boolean)
  async deleteUserCompanyComponentRating(
    @Ctx() ctx: Context,
    @Arg("companyUid", () => String)
    companyUid: string,
    @Arg("seasonUid", () => String)
    seasonUid: string,
    @Arg("component", () => String)
    component: string,
  ): GQLResponse<Boolean> {
    if (!ctx.user) {
      return false;
    }

    const userId = ctx.user.id;

    await ctx.prisma.userCompanyComponentRating.deleteMany({
      where: {
        forUserId: userId,
        forCompany: {
          uid: companyUid,
        },
        forSeason: {
          uid: seasonUid,
        },
        component,
      },
    });

    return true;
  }
}
