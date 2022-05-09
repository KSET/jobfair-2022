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

@Resolver(() => EventReservation)
export class EventReservationFieldResolver {
}

export const transformSelect = transformSelectFor<EventReservationFieldResolver>({});

@InputType()
class EventReservationUpdateInput {
  @Field(() => String)
    id: string = "";

  @Field(() => String)
    type: string = "";

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
      }

      if (!event) {
        return false;
      }

      return await prisma.eventReservation.upsert({
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
    });

    if (!res) {
      return null;
    }

    return res.status;
  }
}
