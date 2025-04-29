import {
  Arg,
  Args,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  ApplicationCocktailType,
  FindManyApplicationCocktailTypeArgs,
  Season,
} from "@generated/type-graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  GQLField,
} from "../../types/helpers";
import { Context } from "../../types/apollo-context";
import { hasAtLeastRole, Role } from "../../helpers/auth";
import { EventsService } from "../../services/events-service";
import { GraphQLResolveInfo } from "graphql";
import {
  transformSelect as transformSelectSeason,
} from "./season";


@Resolver(() => ApplicationCocktailType)
export class CompanyApplicationCocktailTypeFieldResolver {
  @FieldResolver(() => Season, { nullable: true })
  forSeason(
    @Root() cocktailType: ApplicationCocktailType,
  ): GQLField<Season, "nullable"> {
    return cocktailType.forSeason;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationCocktailTypeFieldResolver>({
  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Record<string, unknown>),
    };

    return select;
  },
});

@Resolver(() => ApplicationCocktailType)
export class CompanyApplicationCocktailTypeResolver {
  @Query(() => [ ApplicationCocktailType ])
  availableCocktailTypes(
  @Ctx() ctx: Context,
  @Info() info: GraphQLResolveInfo,
  @Args() args: FindManyApplicationCocktailTypeArgs,
  ) {
    const now = new Date();


    return ctx.prisma.applicationCocktailType.findMany({
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
        forApplicationCocktail: null
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => [ ApplicationCocktailType ])
  cocktailTypes(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationCocktailTypeArgs,
  ) {
    const now = new Date();

    return ctx.prisma.applicationCocktailType.findMany({
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


@Resolver(() => ApplicationCocktailType)
export class CompanyApplicationCocktailAdminResolver {
  @Mutation(() => ApplicationCocktailType, { nullable: true })
  createCocktailType(
    @Ctx() ctx: Context,
    @Arg("type") type: string,
    @Arg("season") season: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }
    
    void EventsService.logEvent("cocktail-type:create", ctx.user.id, type);

    return ctx.prisma.applicationCocktailType.create({
      data: {
        type: type,
        forSeason: {
          connect: {
            uid: season
          }
        }
      }
    });
  }

  @Mutation(() => ApplicationCocktailType)
  async renameCocktailType(
    @Ctx() ctx: Context,
    @Arg("oldCocktailType") oldCocktailType: string,
    @Arg("newCocktailType") newCocktailType: string,
    @Arg("season") seasonUid: string
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

    void EventsService.logEvent("cocktail-type:update", ctx.user.id, { oldType: oldCocktailType, season: seasonUid, newType: newCocktailType });

    return ctx.prisma.applicationCocktailType.update({
      where: {
        forSeasonId_type: {
          type: oldCocktailType,
          forSeasonId: season.id,
        },
      },
      data: {
        type: newCocktailType,
        forSeason: {
          connect: {
            uid: seasonUid
          }
        }
      },
    });
  }
}

