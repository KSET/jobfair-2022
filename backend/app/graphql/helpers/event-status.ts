import {
  toPairs,
} from "rambdax";

const ensureEnumKeysSameAsValues = <T>(_kv: { [K in keyof T]: K }) => null;

export enum EventType {
  workshop = "workshop",
  talk = "talk",
  panel = "panel",
}

ensureEnumKeysSameAsValues(EventType);

export type Event = {
  type: EventType,
};

type EventStatusEntry = {
  value: number,
  filter: ({ type }: Event) => boolean,
};

const _es = <T extends Record<string, EventStatusEntry>>(x: T) => Object.freeze(x);
let i = 0;
export const EventStatus = _es({
  event: {
    value: 2 ** (i++),
    filter: () => true,
  },
  networking: {
    value: 2 ** (i++),
    filter: ({ type }) => EventType.talk === type,
  },
  online: {
    value: 2 ** (i++),
    filter: ({ type }) => EventType.workshop !== type,
  },
});
export type EventStatusType = typeof EventStatus;

export const eventStatusForEvent =
  (event: Event) =>
    toPairs(EventStatus)
      .filter(
        ([ , { filter } ]) =>
          filter(event)
        ,
      )
      .map(
        ([ key ]) =>
          key
        ,
      )
;

export const statusFromEventList =
  (eventList: (keyof EventStatusType)[]) =>
    eventList
      .map((s) => EventStatus[s].value)
      // eslint-disable-next-line no-bitwise
      .reduce((acc, x) => acc | x, 0)
;

export const eventListFromStatus =
  (status: number) =>
    toPairs(EventStatus)
      // eslint-disable-next-line no-bitwise
      .filter(([ , { value } ]) => value & status)
      .map(([ key ]) => key)
;

export const getParticipantCapacityFor =
  (eventType: EventType) => {
    switch (eventType) {
      case EventType.workshop:
        return 15;
      case EventType.talk:
      case EventType.panel:
        return 50;
      default:
        return 0;
    }
  }
;

export const hasParticipantCapacityFor =
  (
    eventType: EventType,
    currentParticipants = 0,
  ) =>
    currentParticipants < getParticipantCapacityFor(eventType)
;

