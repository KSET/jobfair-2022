import {
  ApplicationWorkshop,
  ApplicationPresenter,
} from "@generated/type-graphql";
import {
  Field,
  FieldResolver,
  InputType,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  PresenterCreateInput,
} from "./companyPresenter";

@Resolver(() => ApplicationWorkshop)
export class CompanyApplicationWorkshopFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() application: ApplicationWorkshop,
  ): ApplicationPresenter[] {
    return application.presenters || [];
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationWorkshopFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: select.presenters,
    };

    return select;
  },
});

@InputType()
export class WorkshopCreateInput {
  @Field()
    titleEn: string = "";

  @Field()
    titleHr: string = "";

  @Field()
    descriptionEn: string = "";

  @Field()
    descriptionHr: string = "";

  @Field()
    notesEn: string = "";

  @Field()
    notesHr: string = "";

  @Field()
    goal: string = "";

  @Field()
    language: string = "";

  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}