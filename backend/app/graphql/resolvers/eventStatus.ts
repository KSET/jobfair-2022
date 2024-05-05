import {
  EventReservation,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
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
import {
  CalendarEventService,
} from "../../services/calendar-event-service";
import {
  eventListFromStatus,
  EventStatusType,
  EventType,
  hasParticipantCapacityFor,
} from "../helpers/event-status";
import {
  ValidationResponseFor,
} from "../helpers/validation";

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

  @Field(() => Int)
    status: number = 0;
}

@ObjectType()
class EventReservationStatus {
  @Field(() => Int)
    status: number = 0;
}

@ObjectType()
class EventReservationResponse extends ValidationResponseFor(EventReservationStatus) {
}

@Resolver(() => EventReservation)
export class EventReservationUpdateResolver {
  @Authorized()
  @Mutation(() => EventReservationResponse, { nullable: true })
  async updateEventReservation(
    @Ctx() ctx: Context,
      @Arg("input") input: EventReservationUpdateInput,
  ): GQLResponse<EventReservationResponse> {
    const user = ctx.user!;
    const eventType = input.type;

    const event = await CalendarEventService.getItemIdForEvent(ctx.prisma, eventType, input.id);

    if (!event) {
      return {
        errors: [
          {
            field: "entity",
            message: "errors.event-reservation.event-not-found",
          },
        ],
      };
    }

    return ctx.prisma.$transaction(async (prisma) => {
      const [
        userEntryStatus,
        rawParticipants,
      ] = await Promise.all([
        await prisma.eventReservation.findUnique({
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
        }),
        await prisma.$queryRaw<[
          {
            eventId: number,
            eventType: string,
            status: number,
            visitorCount: bigint,
          }
        ] | []>`
          select
              "eventId", "eventType", "status", count("status") as "visitorCount"
          from
              "EventReservation"
          where
                  "status" <> 0
              and "eventId" = ${ event.id }
              and "eventType" = ${ eventType }
          group by
              "eventId", "eventType", "status"
          limit 1
        `,
      ] as const);


      const participants = {} as Record<keyof EventStatusType, bigint>;
      for (const { status, visitorCount } of rawParticipants) {
        for (const selected of eventListFromStatus(status)) {
          if (!(selected in participants)) {
            participants[selected] = 0n;
          }

          participants[selected] += visitorCount;
        }
      }

      // eslint-disable-next-line no-bitwise
      const statusAdded = ((userEntryStatus?.status ?? 0) ^ input.status) & input.status;
      const newProps = eventListFromStatus(statusAdded);

      // TODO: Add setting or toggle to ignore capacity
      const ignoreCapacityRequirements = true;
      if (!ignoreCapacityRequirements) {
        for (const prop of newProps) {
          if (!hasParticipantCapacityFor(eventType, participants[prop])) {
            throw new Error("errors.event-reservation.capacity-full");
          }
        }
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
    })
      .then((entity) => {
        return {
          entity,
        };
      })
      .catch((err: Error) => {
        return {
          errors: [
            {
              field: "entity",
              message: err.message,
            },
          ],
        };
      })
    ;
  }
}
