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
  transformSelect as transformSelectPresenter,
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
      select: transformSelectPresenter(select.presenters as Record<string, unknown>),
    };

    return select;
  },
});

@InputType()
class WorkshopCreateInputBase {
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
}

@InputType()
export class WorkshopCreateInput extends WorkshopCreateInputBase {
  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}

@InputType()
export class WorkshopsCreateInput extends WorkshopCreateInputBase {
  @Field(() => [ PresenterCreateInput ])
    presenter: PresenterCreateInput[] = [];
}
