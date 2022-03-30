import {
  Field,
  FieldResolver,
  InputType,
  Resolver,
  Root,
} from "type-graphql";
import {
  ApplicationCocktail,
  CompanyApplication,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Dict,
} from "../../types/helpers";
import {
  transformSelect as transformSelectApplication,
} from "./companyApplication";

@Resolver(() => ApplicationCocktail)
export class CompanyApplicationCocktailFieldResolver {
  @FieldResolver(() => [ CompanyApplication ])
  forApplication(
    @Root() cocktail: ApplicationCocktail,
  ): CompanyApplication[] {
    return cocktail.forApplication || [];
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationCocktailFieldResolver>({
  forApplication(select) {
    select.forApplication = {
      select: {
        forApplication: transformSelectApplication(select.forApplication as Dict),
      },
    };

    return select;
  },
});

@InputType()
export class CocktailCreateInput {
  @Field()
    name: string = "";

  @Field()
    colour: string = "";
}
