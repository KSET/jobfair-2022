import {
  FindManySeasonArgs,
  Season,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
  Ctx,
  Field,
  Info,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  omit,
} from "rambdax";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";

@Resolver(() => Season)
export class SeasonFieldResolver {
}

export const transformSelect = transformSelectFor<SeasonFieldResolver>({});

@InputType()
export class SeasonCreateInput {
  @Field()
    name: string = "";

  @Field()
    startsAt: Date = null as unknown as Date;

  @Field()
    endsAt: Date = null as unknown as Date;

  @Field()
    applicationsFrom: Date = null as unknown as Date;

  @Field()
    applicationsUntil: Date = null as unknown as Date;
}

@InputType()
export class SeasonUpdateInput extends SeasonCreateInput {
  @Field()
    uid: string = "";
}

@Resolver(() => Season)
export class SeasonCreateResolver {
  @Mutation(() => Season, { nullable: true })
  createSeason(
  @Ctx() ctx: Context,
    @Arg("info") info: SeasonCreateInput,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.create({
      data: info,
    });
  }

  @Mutation(() => Season, { nullable: true })
  updateSeason(
  @Ctx() ctx: Context,
    @Arg("info") info: SeasonUpdateInput,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.update({
      where: {
        uid: info.uid,
      },
      data: {
        ...omit(
          [
            "uid",
          ],
          info,
        ),
      },
    });
  }

  @Mutation(() => Season, { nullable: true })
  deleteSeason(
  @Ctx() ctx: Context,
    @Arg("uid") uid: string,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.delete({
      where: {
        uid,
      },
    });
  }
}

@Resolver(() => Season)
export class SeasonFindResolver {
  @Query(() => [ Season ])
  seasons(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManySeasonArgs,
  ) {
    return ctx.prisma.season.findMany({
      ...args,
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => Season, { nullable: true })
  currentSeason(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    const now = new Date();

    return ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      select: toSelect(info, transformSelect),
    });
  }
}
