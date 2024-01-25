/* eslint-disable camelcase */
import {
  ApplicationTalkCategory,
  FindManyApplicationTalkCategoryArgs,
  Season,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Info,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";
import {
  GQLField,
} from "../../types/helpers";
import {
  transformSelect as transformSelectSeason,
} from "./season";

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkCategoryFieldResolver {
  @FieldResolver(() => Season, { nullable: true })
  forSeason(
    @Root() talkCategory: ApplicationTalkCategory,
  ): GQLField<Season, "nullable"> {
    return talkCategory.forSeason;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationTalkCategoryFieldResolver>({
  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Record<string, unknown>),
    };

    return select;
  },
});

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkFindResolver {
  @Query(() => [ ApplicationTalkCategory ])
  talkCategories(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationTalkCategoryArgs,
  ) {
    const now = new Date();

    return ctx.prisma.applicationTalkCategory.findMany({
      ...args,
      cursor: undefined,
      where: {
        ...(
          args.where
            ? args.where
            : {
              forSeason: {
                startsAt: {
                  lte: now,
                },
                endsAt: {
                  gte: now,
                },
              },
            }
        ),
      },
      select: toSelect(info, transformSelect),
    });
  }
}

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkAdminResolver {
  @Mutation(() => ApplicationTalkCategory, { nullable: true })
  createTalkCategory(
  @Ctx() ctx: Context,
    @Arg("name") name: string,
    @Arg("season") season: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    void EventsService.logEvent("talk-category:create", ctx.user.id, name);

    return ctx.prisma.applicationTalkCategory.create({
      data: {
        name,
        forSeason: {
          connect: {
            uid: season,
          },
        },
      },
    });
  }

  @Mutation(() => ApplicationTalkCategory, { nullable: true })
  async renameTalkCategory(
  @Ctx() ctx: Context,
    @Arg("oldName") oldName: string,
    @Arg("newName") newName: string,
    @Arg("season") seasonUid: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const season = await ctx.prisma.season.findUnique({
      where: {
        uid: seasonUid,
      },
      select: {
        id: true,
      },
    });

    if (!season) {
      return null;
    }

    void EventsService.logEvent("talk-category:rename", ctx.user.id, { old: oldName, new: newName });

    return ctx.prisma.applicationTalkCategory.update({
      where: {
        forSeasonId_name: {
          name: oldName,
          forSeasonId: season.id,
        },
      },
      data: {
        name: newName,
      },
    });
  }
}
