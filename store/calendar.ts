import {
  defineStore,
} from "pinia";
import {
  values,
} from "rambdax";
import {
 type ToastServiceMethods,
} from "primevue/toastservice";
import {
  EventType,
  statusFromEventList,
} from "~/helpers/event-status";
import {
  type Assign,
} from "~/helpers/type";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  type ICalendarItem,
  type IStoreCalendarEventsAllQuery,
} from "~/graphql/schema";
import {
  useTranslationsStore,
} from "~/store/translations";
import {
  type FragmentType,
  graphql,
} from "~/graphql/client";
import type {
  EventReservationUpdateInput,
} from "~/graphql/client/graphql";

type RawEvent = NonNullable<IStoreCalendarEventsAllQuery["calendar"][number]>;
type RawReservation = NonNullable<IStoreCalendarEventsAllQuery["currentSeason"]>["reservations"][number];

type Reservations = Record<RawReservation["uid"], RawReservation["count"]>;

export type CalendarEvent =
  Assign<
    Pick<
      RawEvent,
      | "companies"
      | "location"
      | "capacity"
    >,
    {
      uid: string,
      calendarUid: string,
      type: EventType,
      reservation: number,
      reservations: Reservations[string],
      start: Date,
      end: Date,
      loading: boolean,
      title: string,
      description: string,
    }
  >
  ;

const hasReservation = <T>(
  x: T,
): T extends { reservation: unknown, } ? true : false => {
  if ("object" !== typeof x || null === x) {
    return false as T extends { reservation: unknown, } ? true : false;
  }

  return ("reservation" in x) as T extends { reservation: unknown, }
    ? true
    : false;
};

const toggleReservationMutation = useMutation(graphql(/* GraphQL */ `
    mutation StoreCalendarEventToggleReservation($input: EventReservationUpdateInput!) {
        updateEventReservation(input: $input) {
            entity {
                status
            }
            errors {
                field
                message
            }
        }
    }
`));

export const CalendarFragment = graphql(/* GraphQL */ `
    fragment StoreCalendarEventsAllCalendarFragment on CalendarItem {
        uid
        location
        start
        end
        capacity
        forWorkshop {
            uid
            titleHr
            titleEn
            descriptionHr
            descriptionEn
            reservation
        }
        forTalk {
            uid
            titleHr
            titleEn
            descriptionHr
            descriptionEn
            reservation
        }
        forFusion {
            uid
            titleHr
            titleEn
            descriptionHr
            descriptionEn
            reservation
        }
        forPanel {
            uid
            name
            description
            reservation
            companies {
                uid
                brandName
            }
        }
        companies {
            uid
            brandName
            rasterLogo {
                fullUrl
                thumbUrl
            }
        }
    }
`);

const calendarEventsQuery = useQuery({
  query: graphql(/* GraphQL */ `
      query StoreCalendarEventsAll {
          calendar {
              ...StoreCalendarEventsAllCalendarFragment
          }

          currentSeason {
              reservations {
                  uid
                  type
                  count
              }
          }
      }
  `),
});

export const useCalendarStore = defineStore("calendar", {
  state: () => ({
    events_: [] as RawEvent[],
    reservations_: {} as Reservations,
  }),

  getters: {
    events(state): CalendarEvent[] {
      const translationsStore = useTranslationsStore();

      return (
        state
          .events_
          .filter((x) => values(x).some(hasReservation))
          .map((x) => {
            type TEvent = NonNullable<
              | ICalendarItem["forWorkshop"]
              | ICalendarItem["forTalk"]
              | ICalendarItem["forFusion"]
              | ICalendarItem["forPanel"]
            >;
            const [
              key,
              event,
            ] =
              Object
                .entries(x)
                .find(([ _, x ]) => hasReservation(x)) as [ string, TEvent ];

            const type = (() => {
              switch (key) {
                case "forWorkshop":
                  return EventType.Workshop;
                case "forTalk":
                  return EventType.Talk;
                case "forFusion":
                  return EventType.Fusion;
                case "forPanel":
                  return EventType.Panel;
              }
            })()!;

            const {
              uid,
              reservation,
            } = event;

            const base = {
              calendarUid: x.uid,
              capacity: x.capacity,
              location: x.location ?? null,
              companies: x.companies,
              reservations: state.reservations_[uid] ?? 0,
              uid,
              type,
              reservation,
              start: new Date(x.start as string),
              end: new Date(x.end as string),
              loading: false,
              title: "[unknown]",
              description: "[unknown]",
            };

            if ("name" in event) {
              base.title = event.name;
              base.description = event.description;
            } else {
              base.title = translationsStore.translateFor(event, "title");
              base.description = translationsStore.translateFor(
                event,
                "description",
              );
            }

            return base;
          })
      );
    },
  },

  actions: {
    async fetchEvents() {
      const data = await calendarEventsQuery().then((x) => x?.data);

      this.events_ = (data?.calendar as undefined | RawEvent[]) ?? [];
      this.reservations_ = data?.currentSeason?.reservations?.reduce(
        (acc, x) => {
          acc[x.uid] = x.count;

          return acc;
        },
        {} as Reservations,
      ) ?? {};

      return this.events;
    },

    async toggleEventReservation<TItem extends Pick<CalendarEvent, "uid" | "type" | "reservation"> & Partial<Pick<CalendarEvent, "loading">>>(
      item: TItem,
      {
        refetchEvents = true,
        toastErrors = null as null | false | ToastServiceMethods,
        updateItem = false,
      } = {},
    ) {
      const translationsStore = useTranslationsStore();

      item.loading = true;
      const resp =
        await toggleReservationMutation({
          input: {
            id: item.uid,
            type: item.type as unknown as EventReservationUpdateInput["type"],
            status: statusFromEventList(item.reservation ? [] : [ "event" ]),
          },
        })
          .then((resp) => resp?.data?.updateEventReservation)
          .catch(() => null)
        ?? null
      ;
      if (refetchEvents) {
        await this.fetchEvents();
      }
      item.loading = false;

      if (toastErrors) {
        if (!resp) {
          toastErrors.add({
            severity: "error",
            summary: "Error",
            detail: translationsStore.translation("errors.event-reservation.generic"),
            life: 10000,
          });
          return;
        }

        const {
          errors,
        } = resp;

        if (errors) {
          for (const error of errors) {
            toastErrors.add({
              severity: "error",
              summary: "Error",
              // eslint-disable-next-line no-template-curly-in-string
              detail: translationsStore.translation(error.message).replaceAll("${eventType}", String(item.type)),
              life: 10000,
            });
          }
          return;
        }
      }

      if (updateItem && resp?.entity) {
        item.reservation = resp.entity.status;
      }

      return resp;
    },
  },
});
