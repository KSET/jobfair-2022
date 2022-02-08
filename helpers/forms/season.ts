import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  ISeason,
} from "~/graphql/schema";

const withoutTime =
  (date: ConstructorParameters<typeof Date>[0]) => {
    const d = new Date(date);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  }
;

const today =
  () =>
    withoutTime(new Date())
;

const fromToday =
  (days: number) => {
    const now = today();
    now.setDate(new Date().getDate() + days);
    return now;
  }
;

const tomorrow =
  () =>
    fromToday(1)
;

type Season = Omit<ISeason,
  "uid"
  | "_count">;
export const seasonCreate =
  <T extends Season>(season?: T | null): Record<keyof Season, InputEntry> =>
    ({
      name: {
        type: "text",
        value: season?.name || "",
      },
      startsAt: {
        type: "datetime-local",
        value: season?.startsAt || today(),
      },
      endsAt: {
        type: "datetime-local",
        value: season?.endsAt || tomorrow(),
      },
    })
;
