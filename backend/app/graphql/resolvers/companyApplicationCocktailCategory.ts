import {
  Arg,
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
  ApplicationCocktailCategory,
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

@InputType()
export class CocktailCreateInput {
  @Field()
    name: string = "";

  @Field()
    colour: string = "";
  
  @Field()
    ingredients: string = "";
}

@InputType()
export class CocktailChooseInput {
  @Field()
    name: string = "";
}

@Resolver(() => ApplicationCocktailCategory)
export class CompanyApplicationCocktailCategoryFieldResolver {
  @FieldResolver(() => Season, { nullable: true })
  forSeason(
    @Root() cocktailCategory: ApplicationCocktailCategory,
  ): GQLField<Season, "nullable"> {
    return cocktailCategory.forSeason;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationCocktailCategoryFieldResolver>({
  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Record<string, unknown>),
    };

    return select;
  },
});

@Resolver(() => ApplicationCocktailCategory)
export class CompanyApplicationCocktailCategoryResolver {
  @Query(() => [ ApplicationCocktailCategory ])
  availableCocktailCategories(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    const now = new Date();

    return ctx.prisma.applicationCocktailCategory.findMany({
      cursor: undefined,
      where: {
        forSeason: {
          startsAt: {
            lte: now,
          },
          endsAt: {
            gte: now,
          },
        },
        forApplication: null
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => [ ApplicationCocktailCategory ])
  cocktailCategories(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo
  ) {
    const now = new Date();

    return ctx.prisma.applicationCocktailCategory.findMany({
      cursor: undefined,
      where: {
        forSeason: {
          startsAt: {
            lte: now,
          },
          endsAt: {
            gte: now,
          },
        }
      },
      select: toSelect(info, transformSelect),
    });
  }
}


@Resolver(() => ApplicationCocktailCategory)
export class CompanyApplicationCocktailAdminResolver {
  @Mutation(() => ApplicationCocktailCategory, { nullable: true })
  createCocktailCategory(
    @Ctx() ctx: Context,
    @Arg("info") cocktail: CocktailCreateInput,
    @Arg("seasonUid") season: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }
    
    void EventsService.logEvent("cocktail-category:create", ctx.user.id, cocktail.name);

    return ctx.prisma.applicationCocktailCategory.create({
      data: {
        colour: cocktail.colour,
        name: cocktail.name,
        ingredients: cocktail.ingredients,
        forSeason: {
          connect: {
            uid: season
          }
        }
      }
    });
  }

  @Mutation(() => ApplicationCocktailCategory)
  async updateCocktailCategory(
    @Ctx() ctx: Context,
    @Arg("cocktailName") cocktailName: string,
    @Arg("info") cocktail: CocktailCreateInput,
    @Arg("seasonUid") seasonUid: string
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

    void EventsService.logEvent("cocktail-category:update", ctx.user.id, { oldName: cocktailName, season: seasonUid, new: cocktail });

    return ctx.prisma.applicationCocktailCategory.update({
      where: {
        forSeasonId_name: {
          name: cocktailName,
          forSeasonId: season.id,
        },
      },
      data: {
        ...cocktail,
        forSeason: {
          connect: {
            uid: seasonUid
          }
        }
      },
    });
  }

}

