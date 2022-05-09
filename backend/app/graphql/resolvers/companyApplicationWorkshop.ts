import {
  ApplicationWorkshop,
  ApplicationPresenter,
  CalendarItem,
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
  Dict,
  GQLField,
} from "../../types/helpers";
import {
  PresenterCreateInput,
  transformSelect as transformSelectPresenter,
} from "./companyPresenter";
import {
  transformSelect as transformSelectEvent,
} from "./calendarItem";

@Resolver(() => ApplicationWorkshop)
export class CompanyApplicationWorkshopFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() application: ApplicationWorkshop,
  ): ApplicationPresenter[] {
    return application.presenters || [];
  }

  @FieldResolver(() => CalendarItem, { nullable: true })
  event(
    @Root() application: ApplicationWorkshop,
  ): GQLField<CalendarItem, "nullable"> {
    return application.event;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationWorkshopFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: transformSelectPresenter(select.presenters as Record<string, unknown>),
    };

    return select;
  },

  event(select) {
    select.event = {
      select: transformSelectEvent(select.event as Dict),
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
