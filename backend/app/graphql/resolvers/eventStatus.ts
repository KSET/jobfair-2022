import {
  EventReservation,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  registerEnumType,
  Resolver,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  GQLResponse,
} from "../../types/helpers";

enum EventType {
  workshop = "workshop",
  talk = "talk",
  panel = "panel",
  hotTalk = "hot-talk",
}

registerEnumType(EventType, {
  name: "EventType",
});

@Resolver(() => EventReservation)
export class EventReservationFieldResolver {
}

export const transformSelect = transformSelectFor<EventReservationFieldResolver>({});

@InputType()
class EventReservationUpdateInput {
  @Field(() => String)
    id: string = "";

  @Field(() => EventType)
    type: EventType = EventType.workshop;

  @Field(() => Number)
    status: number = 0;
}

@Resolver(() => EventReservation)
export class EventReservationUpdateResolver {
  @Authorized()
  @Mutation(() => Number, { nullable: true })
  async updateEventReservation(
    @Ctx() ctx: Context,
      @Arg("input") input: EventReservationUpdateInput,
  ): GQLResponse<number, "nullable"> {
    const user = ctx.user!;
    const eventType = input.type;

    const res = await ctx.prisma.$transaction(async (prisma) => {
      let event;
      switch (eventType) {
        case "workshop": {
          event = await prisma.applicationWorkshop.findFirst({
            where: {
              uid: input.id,
            },
            select: {
              id: true,
            },
          });
          break;
        }
        case "talk": {
          event = await prisma.applicationTalk.findFirst({
            where: {
              uid: input.id,
            },
            select: {
              id: true,
            },
          });
          break;
        }
        case "panel": {
          event = await prisma.companyPanel.findFirst({
            where: {
              uid: input.id,
            },
            select: {
              id: true,
            },
          });
          break;
        }
      }

      if (!event) {
        throw new Error("Event not found");
      }

      return prisma.eventReservation.upsert({
        create: {
          eventType,
          eventId: event.id,
          userId: user.id,
          status: input.status,
        },
        update: {
          status: input.status,
        },
        where: {
          // eslint-disable-next-line camelcase
          eventId_eventType_userId: {
            eventId: event.id,
            eventType,
            userId: user.id,
          },
        },
        select: {
          status: true,
        },
      });
    }).catch(() => null);

    if (!res) {
      return null;
    }

    return res.status;
  }
}
