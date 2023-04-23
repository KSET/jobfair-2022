import {
  createEvents,
  type EventAttributes,
} from "ics";
import {
  Prisma,
} from "@prisma/client";
import {
  StatusCodes,
} from "http-status-codes";
import {
  Router,
} from "../../../../helpers/route";
import {
  prisma,
} from "../../../../providers/prisma";
import {
  Dict,
} from "../../../../types/helpers";
import {
  RouteHandler,
} from "../../../../helpers/request";

const PUBLIC_URL = process.env.PUBLIC_URL ?? "https://jobfair.fer.unizg.hr";
const PUBLIC_DOMAIN = new URL(PUBLIC_URL).hostname;

const router = new Router();

const toDateArray = <TDate extends Date | string>(x: TDate) => {
  const date = new Date(x);

  return [ date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes() ] as [number, number, number, number, number];
};

const getCalendarItems = async ({
  season,
  calendarName,
  calendarSuffix,
  markAsBusy = false,
  where,
}: {
  season?: {
    id: number,
    name: string,
  },
  calendarName?: string,
  calendarSuffix?: string,
  markAsBusy?: boolean,
  where?: Prisma.CalendarItemWhereInput,
} = {}) => {
  const currentSeason =
    season
    ?? await prisma.season.findFirst({
      select: {
        id: true,
        name: true,
      },
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
    })
  ;

  if (!currentSeason) {
    return [];
  }

  if (!calendarName) {
    calendarName = currentSeason.name;
  }

  if (calendarSuffix) {
    calendarName += ` ${ calendarSuffix.trim() }`;
  }

  const events = await prisma.calendarItem.findMany({
    include: {
      forPanel: {
        include: {
          companies: {
            include: {
              forCompany: {
                select: { brandName: true },
              },
            },
          },
        },
      },
      forTalk: {
        include: {
          presenters: true,
        },
      },
      forWorkshop: {
        include: {
          presenters: true,
        },
      },
    },

    where: {
      forSeasonId: currentSeason.id,
      ...where,
    },
  });

  return (
    events
      .map((event): EventAttributes => {
        return {
          calName: calendarName,
          uid: `${ event.uid }@${ PUBLIC_DOMAIN }`,
          busyStatus: markAsBusy ? "BUSY" : "FREE",

          start: toDateArray(event.start),
          startInputType: "utc",

          end: toDateArray(event.end),
          endInputType: "utc",

          title: event.title ?? event.forTalk?.titleEn ?? event.forWorkshop?.titleEn ?? event.forPanel?.name ?? "[Untitled]",
          description: event.text ?? event.forTalk?.descriptionEn ?? event.forWorkshop?.descriptionEn ?? event.forPanel?.description,

          location: event.location ?? undefined,

          categories: event.type
            ? [
              event.type,
            ]
            : undefined,

          url: `${ PUBLIC_URL }/calendar/event/${ event.uid }`,
        };
      })
  );
};

const respondWithType = async <T>(
  events: Awaited<ReturnType<typeof getCalendarItems>>,
  req: Parameters<RouteHandler<T>>[0],
  res: Parameters<RouteHandler<T>>[1],
) => {
  try {
    switch ((req.params as Dict<string>).ext) {
      case "json":{
        return res.json(events);
      }

      case "ics": {
        if (!events.length) {
          return res.sendStatus(StatusCodes.NOT_FOUND);
        }

        try {
          const result = await new Promise((resolve, reject) => {
            createEvents(events, (err, val) => err ? reject(err) : resolve(val));
          });
          return res.type(".ics").send(result);
        } catch (e) {
          console.error(e);
          return res.sendStatus(500);
        }
      }

      default: {
        return res.sendStatus(StatusCodes.NOT_ACCEPTABLE);
      }
    }
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    return res.end();
  }
};

router.getRaw("/all.:ext", async (req, res) => {
  const events = await getCalendarItems({
    calendarSuffix: " - All",
  });

  return respondWithType(events, req, res);
});

router.getRaw("/:uid.:ext", async (req, res) => {
  const reservations = await prisma.eventReservation.findMany({
    select: {
      eventId: true,
      eventType: true,
    },
    where: {
      user: {
        uid: (req.params as Dict<string>).uid ?? "$$NO_USER$$",
      },
      status: {
        gt: 0,
      },
    },
  });

  const eventIds = reservations.map((x) => x.eventId);

  const events = await getCalendarItems({
    calendarSuffix: " - All",
    markAsBusy: true,
    where: {
      OR: [
        {
          forPanelId: {
            in: eventIds,
          },
        },
        {
          forTalkId: {
            in: eventIds,
          },
        },
        {
          forWorkshopId: {
            in: eventIds,
          },
        },
      ],
    },
  });

  return respondWithType(events, req, res);
});

export default router;
