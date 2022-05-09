import {
  ApplicationWorkshop,
  ApplicationPresenter,
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

  @FieldResolver(() => Number)
  async reservation(
    @Root() application: ApplicationWorkshop,
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
          eventType: "workshop",
          eventId: application.id!,
          userId: user.id,
        },
      },
    });

    return reservation?.status ?? 0;
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

  reservation(select) {
    select.id = true;

    delete select.reservation;

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
