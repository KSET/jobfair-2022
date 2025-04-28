import {
  ApplicationCocktail,
  ApplicationCocktailType,
} from "@generated/type-graphql";
import {
  FieldResolver,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ApplicationCocktail)
export class CompanyApplicationCocktailFieldResolver {
  @FieldResolver(() => ApplicationCocktailType)
  type(
  @Root() application: ApplicationCocktail,
  ) {
    return application.type;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationCocktailFieldResolver>({
  type(select) {
    select.type = {
      select: select.type,
    };

    return select;
  },
});
