import {
  User,
} from "@generated/type-graphql";
import {
  Prisma,
} from "@prisma/client";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Info,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import {
  Role,
  hasAtLeastRole,
} from "../../helpers/auth";
import {
  GQLResponse,
} from "../../types/helpers";
import {
  toSelect,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  transformSelect as transformSelectUser,
} from "./user";

@ObjectType()
class GateGuardianScanResponse {
  @Field(() => User, { nullable: true })
    user: null | User = null;

  @Field()
    hasReservation: boolean = false;

  @Field()
    alreadyScanned: boolean = false;

  @Field(() => String, { nullable: true })
    error: string | null = "";
}
@Resolver()
export class GateGuardianResolver {
  @Authorized()
  @Mutation(() => GateGuardianScanResponse, { nullable: true })
  async gateGuardianScan(
    @Ctx() ctx: Context,
      @Arg("userUid") userUid: string,
      @Arg("eventUid") calendarItemUid: string,
      @Arg("eventType") calendarItemType: string,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<GateGuardianScanResponse, "nullable"> {
    const user = ctx.user!;

    const canView =
      user.roles.includes(Role.Scanner)
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return {
        error: "Access denied. Cannot use this endpoint.",
      };
    }

    const selectItems = toSelect(gqlInfo, (x) => x) as {
      user: Prisma.UserSelect,
      hasReservation: boolean,
    } | undefined;

    if (!selectItems) {
      return {
        error: "Something went wrong. Invalid query.",
      };
    }

    const select = transformSelectUser(selectItems.user);
    select.id = true;

    const dbUser = await ctx.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
      select,
    }) as User | null;

    if (!dbUser) {
      return {
        user: null,
        hasReservation: false,
        error: "User not found.",
      };
    }

    if ("ulaz" === calendarItemType) {
      const currentSeason = await ctx.prisma.season.findFirst({
        where: {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        },
        select: {
          id: true,
        },
      });

      if (!currentSeason) {
        return {
          user: dbUser,
          hasReservation: false,
          error: "No active season.",
        };
      }

      const previousScan = await ctx.prisma.gateGuardianLog.findFirst({
        where: {
          eventId: 0,
          eventType: calendarItemType,
          forSeasonId: currentSeason.id,
          forUserId: dbUser.id,
        },
        select: {
          id: true,
        },
      });

      await ctx.prisma.gateGuardianLog.create({
        data: {
          eventId: 0,
          eventType: calendarItemType,
          forUser: {
            connect: {
              id: dbUser.id!,
            },
          },
          scannedBy: {
            connect: {
              id: user.id,
            },
          },
          forSeason: {
            connect: {
              id: currentSeason.id,
            },
          },
        },
      });

      return {
        user: dbUser,
        hasReservation: true,
        alreadyScanned: Boolean(previousScan),
      };
    }

    const calendarItem = await ctx.prisma.calendarItem.findFirst({
      where: {
        uid: calendarItemUid,
        type: calendarItemType,
      },
      select: {
        forTalkId: true,
        forWorkshopId: true,
        forPanelId: true,
        forSeasonId: true,
      },
    });

    if (!calendarItem) {
      return {
        user: dbUser,
        hasReservation: false,
        error: "Calendar event not found. Please check if the right event is selected.",
      };
    }

    const calendarItemId =
      calendarItem.forTalkId
      ?? calendarItem.forWorkshopId
      ?? calendarItem.forPanelId
      ?? 0
      ;

    const reservation = await ctx.prisma.eventReservation.findFirst({
      where: {
        userId: dbUser.id,
        eventId: {
          in: [
            calendarItem?.forTalkId,
            calendarItem?.forWorkshopId,
            calendarItem?.forPanelId,
            0,
          ].filter(Boolean),
        },
        eventType: calendarItemType,
        status: {
          gt: 0,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!reservation) {
      return {
        user: dbUser,
        hasReservation: false,
      };
    }

    const previousScan = await ctx.prisma.gateGuardianLog.findFirst({
      where: {
        eventId: calendarItemId,
        eventType: calendarItemType,
        forSeasonId: calendarItem.forSeasonId,
        forUserId: dbUser.id,
      },
      select: {
        id: true,
      },
    });

    await ctx.prisma.gateGuardianLog.create({
      data: {
        eventId: calendarItemId,
        eventType: calendarItemType,
        forSeason: {
          connect: {
            id: calendarItem.forSeasonId,
          },
        },
        forUser: {
          connect: {
            id: dbUser.id!,
          },
        },
        scannedBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      user: dbUser,
      hasReservation: true,
      alreadyScanned: Boolean(previousScan),
    };
  }
}
