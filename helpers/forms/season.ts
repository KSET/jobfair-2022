import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  type ISeason,
} from "~/graphql/schema";
import {
  today,
  tomorrow,
} from "~/helpers/date";

type Season = Omit<ISeason,
  "uid"
  | "applications"
  | "companyScannedCvs"
  | "calendar"
  | "entryCount"
  | "panel"
  | "reservations"
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
      applicationsEditableFrom: {
        type: "datetime-local",
        value: season?.applicationsEditableFrom || today(),
      },
      applicationsEditableUntil: {
        type: "datetime-local",
        value: season?.applicationsEditableUntil || tomorrow(),
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
      eventFrom: {
        type: "datetime-local",
        value: season?.eventFrom || today(),
      },
      eventUntil: {
        type: "datetime-local",
        value: season?.eventUntil || tomorrow(),
      },
      feedbackFrom: {
        type: "datetime-local",
        value: season?.feedbackFrom || today(),
      },
      feedbackUntil: {
        type: "datetime-local",
        value: season?.feedbackUntil || tomorrow(),
      },
      scheduleFrom: {
        type: "datetime-local",
        value: season?.scheduleFrom || today(),
      },
      scheduleUntil: {
        type: "datetime-local",
        value: season?.scheduleUntil || tomorrow(),
      },
    })
;
