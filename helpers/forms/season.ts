import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  ISeason,
} from "~/graphql/schema";
import {
  today,
  tomorrow,
} from "~/helpers/date";

type Season = Omit<ISeason,
  "uid"
  | "applications"
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
      applicationsFrom: {
        type: "datetime-local",
        value: season?.applicationsFrom || today(),
      },
      applicationsUntil: {
        type: "datetime-local",
        value: season?.applicationsUntil || tomorrow(),
      },
      showParticipantsFrom: {
        type: "datetime-local",
        value: season?.showParticipantsFrom || today(),
      },
      showParticipantsUntil: {
        type: "datetime-local",
        value: season?.showParticipantsUntil || tomorrow(),
      },
      showPartnersFrom: {
        type: "datetime-local",
        value: season?.showPartnersFrom || today(),
      },
      showPartnersUntil: {
        type: "datetime-local",
        value: season?.showPartnersUntil || tomorrow(),
      },
      showSponsorsFrom: {
        type: "datetime-local",
        value: season?.showSponsorsFrom || today(),
      },
      showSponsorsUntil: {
        type: "datetime-local",
        value: season?.showSponsorsUntil || tomorrow(),
      },
    })
;
