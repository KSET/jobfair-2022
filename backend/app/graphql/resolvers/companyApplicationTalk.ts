import {
  ApplicationTalk,
  ApplicationPresenter,
  ApplicationTalkCategory,
  CalendarItem,
} from "@generated/type-graphql";
import {
  Ctx,
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
  Context,
} from "../../types/apollo-context";
import {
  PresenterCreateInput,
  transformSelect as transformSelectPresenter,
} from "./companyPresenter";
import {
  transformSelect as transformSelectEvent,
} from "./calendarItem";

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

  @FieldResolver(() => CalendarItem, { nullable: true })
  event(
    @Root() application: ApplicationTalk,
  ): GQLField<CalendarItem, "nullable"> {
    return application.event;
  }

  @FieldResolver(() => Number)
  async reservation(
    @Root() application: ApplicationTalk,
      @Ctx() ctx: Context,
  ): Promise<GQLField<number>> {
    const { user } = ctx;

    if (!user) {
      return 0;
    }

    const reservation = await ctx.prisma.eventReservation.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        eventId_eventType_userId: {
          eventType: "talk",
          eventId: application.id!,
          userId: user.id,
        },
      },
    });

    return reservation?.status ?? 0;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationTalkFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: transformSelectPresenter(select.presenters as Record<string, unknown>),
    };

    return select;
  },

  category(select) {
    select.category = {
      select: select.category,
    };

    return select;
  },

  event(select) {
    select.event = {
      select: transformSelectEvent(select.event as Dict),
    };

    return select;
  },

  reservation(select) {
    select.id = true;

    delete select.reservation;

    return select;
  },
});

@InputType()
export class TalkCreateInputBase {
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
}

@InputType()
export class TalkCreateInput extends TalkCreateInputBase {
  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}

@InputType()
export class TalksCreateInput extends TalkCreateInputBase {
  @Field(() => [ PresenterCreateInput ])
    presenter: PresenterCreateInput[] = [];
}
