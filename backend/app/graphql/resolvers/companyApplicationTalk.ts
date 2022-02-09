import {
  ApplicationTalk,
  ApplicationPresenter,
  ApplicationTalkCategory,
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

@Resolver(() => ApplicationTalk)
export class CompanyApplicationTalkFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() application: ApplicationTalk,
  ): ApplicationPresenter[] {
    return application.presenters || [];
  }

  @FieldResolver(() => ApplicationTalkCategory)
  category(
  @Root() application: ApplicationTalk,
  ) {
    return application.category;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationTalkFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: select.presenters,
    };

    return select;
  },

  category(select) {
    select.category = {
      select: select.category,
    };

    return select;
  },
});

@InputType()
export class TalkCreateInput {
  @Field()
    titleEn: string = "";

  @Field()
    titleHr: string = "";

  @Field()
    descriptionEn: string = "";

  @Field()
    descriptionHr: string = "";

  @Field()
    category: string = "";

  @Field()
    language: string = "";

  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}
