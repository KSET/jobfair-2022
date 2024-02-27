import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
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
        value: new Date(season?.startsAt || today()).toISOString(),
      },
      endsAt: {
        type: "datetime-local",
        value: new Date(season?.endsAt || tomorrow()).toISOString(),
      },
      applicationsFrom: {
        type: "datetime-local",
        value: new Date(season?.applicationsFrom || today()).toISOString(),
      },
      applicationsUntil: {
        type: "datetime-local",
        value: new Date(season?.applicationsUntil || tomorrow()).toISOString(),
      },
      applicationsEditableFrom: {
        type: "datetime-local",
        value: new Date(season?.applicationsEditableFrom || today()).toISOString(),
      },
      applicationsEditableUntil: {
        type: "datetime-local",
        value: new Date(season?.applicationsEditableUntil || tomorrow()).toISOString(),
      },
      showParticipantsFrom: {
        type: "datetime-local",
        value: new Date(season?.showParticipantsFrom || today()).toISOString(),
      },
      showParticipantsUntil: {
        type: "datetime-local",
        value: new Date(season?.showParticipantsUntil || tomorrow()).toISOString(),
      },
      showPartnersFrom: {
        type: "datetime-local",
        value: new Date(season?.showPartnersFrom || today()).toISOString(),
      },
      showPartnersUntil: {
        type: "datetime-local",
        value: new Date(season?.showPartnersUntil || tomorrow()).toISOString(),
      },
      showSponsorsFrom: {
        type: "datetime-local",
        value: new Date(season?.showSponsorsFrom || today()).toISOString(),
      },
      showSponsorsUntil: {
        type: "datetime-local",
        value: new Date(season?.showSponsorsUntil || tomorrow()).toISOString(),
      },
      eventFrom: {
        type: "datetime-local",
        value: new Date(season?.eventFrom || today()).toISOString(),
      },
      eventUntil: {
        type: "datetime-local",
        value: new Date(season?.eventUntil || tomorrow()).toISOString(),
      },
      feedbackFrom: {
        type: "datetime-local",
        value: new Date(season?.feedbackFrom || today()).toISOString(),
      },
      feedbackUntil: {
        type: "datetime-local",
        value: new Date(season?.feedbackUntil || tomorrow()).toISOString(),
      },
      scheduleFrom: {
        type: "datetime-local",
        value: new Date(season?.scheduleFrom || today()).toISOString(),
      },
      scheduleUntil: {
        type: "datetime-local",
        value: new Date(season?.scheduleUntil || tomorrow()).toISOString(),
      },
    })
;
