import {
  ICalendarItem,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  toDatetimeString,
  today,
  yesterday,
} from "~/helpers/date";

export enum CalendarType {
  Talk = "talk",
  Workshop = "workshop",
  HotTalk = "hot-talk",
  Panel = "panel",
  LoosenUp = "loosen-up",
}

const calendarTypeLabels: Record<CalendarType, string> = {
  [CalendarType.HotTalk]: "Hot Talk",
  [CalendarType.Talk]: "Talk",
  [CalendarType.LoosenUp]: "Loosen Up",
  [CalendarType.Panel]: "Panel",
  [CalendarType.Workshop]: "Workshop",
};

type Item<T> = Partial<T> | null | undefined;

type CalendarItem = Omit<ICalendarItem,
  | "uid"
  | "forWorkshop"
  | "forTalk"
  | "forPanel"
  | "hasEvent"
  | never>;
export const calendarItemCreate =
  <T extends CalendarItem>(item?: Item<T>): Record<keyof CalendarItem, InputEntry> =>
    ({
      type: {
        value: item?.type ?? "",
        type: "dropdown" as const,
        options: Object.values(CalendarType).map((value) => ({
          label: calendarTypeLabels[value],
          value,
        })),
      },
      title: {
        value: item?.title ?? "",
        type: "text" as const,
        required: false,
      },
      start: {
        value: toDatetimeString(item?.start as string || yesterday()),
        type: "datetime-local",
      },
      end: {
        value: toDatetimeString(item?.end as string || today()),
        type: "datetime-local",
      },
      location: {
        value: item?.location ?? "",
        type: "text" as const,
        required: false,
      },
      text: {
        value: item?.text ?? "",
        type: "textarea" as const,
        required: false,
      },
      grouped: {
        value: item?.grouped ?? true,
        type: "checkbox" as const,
        required: false,
      },
    })
;

type CalendarItemForEntity = Pick<ICalendarItem, "location" | "start" | "end">;
export const calendarItemForEntityCreate =
  <T extends CalendarItemForEntity>(item?: Item<T>): Record<keyof CalendarItemForEntity, InputEntry> =>
    ({
      start: {
        value: toDatetimeString(item?.start as string || yesterday()),
        type: "datetime-local",
      },
      end: {
        value: toDatetimeString(item?.end as string || today()),
        type: "datetime-local",
      },
      location: {
        value: item?.location ?? "",
        type: "text" as const,
        required: false,
      },
    })
;

