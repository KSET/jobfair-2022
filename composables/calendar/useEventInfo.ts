import {
 type UnwrapRef,
} from "vue";
import EventIconWorkshop from "~/assets/images/icon/event-icons/workshops.svg?url";
import EventIconTalk from "~/assets/images/icon/event-icons/talks.svg?url";
import EventIconPanel from "~/assets/images/icon/event-icons/panel.svg?url";
import EventIconHotTalk from "~/assets/images/icon/event-icons/hotTalk.svg?url";

import {
  computed,
  unref,
} from "#imports";
import type {
  CalendarEvent,
} from "~/store/calendar";
import {
  useTranslationsStore,
} from "~/store/translations";
import {
 IEventType,
} from "~/graphql/schema";

export type TCalendarEvent =
  Pick<
    CalendarEvent,
    | "start"
    | "location"
    | "type"
    | "end"
  > & {
    start: Date | string,
    end: Date | string,
  }
  ;

const id_ = Symbol("event info");

export const useEventInfo = (event: TCalendarEvent) => {
  const translationsStore = useTranslationsStore();

  const eventTimeFormatter = computed(() => new Intl.DateTimeFormat(
    translationsStore.currentLanguageIso,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ));

  const eventDayFormatter = computed(() => new Intl.DateTimeFormat(
    translationsStore.currentLanguageIso,
    {
      weekday: "long",
    },
  ));

  return computed(() => {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);

    const text =
      [
        unref(eventDayFormatter).format(startTime),
        unref(eventTimeFormatter).format(startTime),
        event.location,
      ]
        .filter(Boolean)
        .join(" | ")
    ;

    const base = {
      __id: id_,
      text,
      type: event.type,
      durationMs: endTime.getTime() - startTime.getTime(),
      icon: null as string | null,
    };

    switch (base.type) {
      case IEventType.Workshop: {
        base.icon = EventIconWorkshop;
        break;
      }

      case IEventType.Talk: {
        base.icon = EventIconTalk;
        break;
      }

      case IEventType.Fusion: {
        base.icon = EventIconTalk;
        break;
      }

      case IEventType.Panel: {
        base.icon = EventIconPanel;
        break;
      }

      case IEventType.HotTalk: {
        base.icon = EventIconHotTalk;
        break;
      }
    }

    return base;
  });
};

export type EventInfo = UnwrapRef<ReturnType<typeof useEventInfo>>;
