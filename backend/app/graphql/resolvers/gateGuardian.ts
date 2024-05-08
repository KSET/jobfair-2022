import {
  User,
  CalendarItem,
  GateGuardianLog,
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
  FieldResolver,
  Info,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  Role,
  hasAtLeastRole,
} from "../../helpers/auth";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  transformSelect as transformSelectUser,
} from "./user";
import {
  transformSelect as transformSelectCalendarItem,
} from "./calendarItem";

@Resolver((_of) => GateGuardianLog)
export class GateGuardianLogFieldResolver {
  @FieldResolver(() => User, { nullable: true })
  forUser(@Root() log: GateGuardianLog): GQLField<User, "nullable"> {
    return Promise.resolve(log.forUser);
  }

  @FieldResolver(() => User, { nullable: true })
  scannedBy(@Root() log: GateGuardianLog): GQLField<User, "nullable"> {
    return Promise.resolve(log.scannedBy);
  }

  @FieldResolver(() => CalendarItem, { nullable: true })
  forCalendarItem(
    @Root() log: GateGuardianLog & { calendarItem?: CalendarItem, },
  ): GQLField<CalendarItem, "nullable"> {
    return Promise.resolve(log.calendarItem);
  }
}

export const transformSelect = transformSelectFor<GateGuardianLogFieldResolver>(
  {
    forUser(select) {
      select.forUser = {
        select: transformSelectUser(select.forUser as Dict),
      };
      return select;
    },
    scannedBy(select) {
      select.scannedBy = {
        select: transformSelectUser(select.scannedBy as Dict),
      };
      return select;
    },
    forCalendarItem(select) {
      const item = (transformSelectCalendarItem(select.forCalendarItem as Dict));
      select.forCalendarItem = item;
      return select;
    },
  },
);

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
        user: null,
        hasReservation: false,
        alreadyScanned: false,
        error: "Access denied. Cannot use this endpoint.",
      };
    }

    const selectItems = toSelect(gqlInfo, (x) => x) as {
      user: Prisma.UserSelect,
      hasReservation: boolean,
    } | undefined;

    if (!selectItems) {
      return {
        user: null,
        hasReservation: false,
        alreadyScanned: false,
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
        alreadyScanned: false,
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
          alreadyScanned: false,
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
        alreadyScanned: false,
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
        alreadyScanned: false,
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

  @Authorized(Role.Admin)
  @Query(() => [ GateGuardianLog ], { nullable: true })
  async gateGuardianScanList(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("season") seasonUid: string,
  ): GQLResponse<GateGuardianLog[]> {
    const select = toSelect(info, transformSelect);

    const forCalendarItemSelect = select.forCalendarItem;
    delete select.forCalendarItem;

    const log = await ctx.prisma.gateGuardianLog.findMany({
      where: {
        forSeason: {
          uid: seasonUid,
        },
      },
      select: {
        ...select,
        eventId: true,
        eventType: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const forCalendarItem = await (async () => {
      if (!forCalendarItemSelect) {
        return null;
      }

      const calendarItemsRaw = await ctx.prisma.calendarItem.findMany({
        where: {
          forSeason: {
            uid: seasonUid,
          },
        },
        select: {
          ...forCalendarItemSelect,
          forTalkId: true,
          forWorkshopId: true,
          forPanelId: true,
        },
      });

      const calendarItems = calendarItemsRaw.map((x) => {
        const eventId = x.forTalkId ?? x.forWorkshopId ?? x.forPanelId ?? 0;
        const eventType = (() => {
          if (x.forTalkId) {
            return "talk";
          }
          if (x.forWorkshopId) {
            return "workshop";
          }
          if (x.forPanelId) {
            return "panel";
          }
          return null;
        })();

        return ({
          ...x,
          eventId,
          eventType,
        });
      });

      const eventMap = new Map<`${ string }.${ number }`, unknown>();
      for (const item of calendarItems) {
        const key = `${ item.eventType ?? "" }.${ item.eventId }` as const;
        eventMap.set(key, item);
      }

      return eventMap;
    })();

    return log.map((x) => ({
      ...x,
      calendarItem: forCalendarItem?.get(`${ x.eventType }.${ x.eventId }`) ?? null,
    }));
  }
}
