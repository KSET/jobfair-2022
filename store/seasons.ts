/* eslint-disable @typescript-eslint/unbound-method */

import {
  defineStore,
} from "pinia";
import {
  type ISeason,
} from "~/graphql/schema";
import {
  type WithoutSuffix,
} from "~/helpers/type";

const inRange = (from: Date | string, until: Date | string) => {
  const now = new Date();

  if (!from || !until) {
    return false;
  }

  return new Date(from) <= now && now <= new Date(until);
};

type DateRangeKeysOf<T> =
  WithoutSuffix<T, "From">
  & WithoutSuffix<T, "Until">
  ;

const areOpen =
  <T extends DateRangeKeysOf<keyof ISeason>>(
    name: T,
    season: Partial<Pick<ISeason, `${ T }From` | `${ T }Until`>> | null | undefined,
  ) => {
    if (!season) {
      return false;
    }

    return inRange(
      season[`${ name }From`] as string,
      season[`${ name }Until`] as string,
    );
  };

type Reservation = {
  uid: string,
  type: string,
  count: number,
};

export const useSeasonsStore = defineStore(
  "seasons",
  {
    state: () => ({
      season: null as (Partial<ISeason> | null),
      currentSeason: null as (Partial<ISeason> | null),
      reservations_: [] as Reservation[],
    }),

    getters: {
      applicationsOpen(state) {
        return areOpen("applications", state.currentSeason);
      },

      areApplicationsEditable(state) {
        return areOpen("applicationsEditable", state.currentSeason);
      },

      areParticipantsShown(state) {
        return areOpen("showParticipants", state.currentSeason);
      },

      isSignUpPossible() {
        const { currentSeason } = this;

        if (!currentSeason) {
          return false;
        }

        const start = currentSeason.showParticipantsFrom as Date;
        const end = currentSeason.eventUntil as Date;

        const inEventRange = inRange(start, end);
        const scheduleShown = this.isScheduleShown;

        return inEventRange && scheduleShown;
      },

      arePartnersShown(state) {
        return areOpen("showPartners", state.currentSeason);
      },

      areSponsorsShown(state) {
        return areOpen("showSponsors", state.currentSeason);
      },

      isEventOngoing(state) {
        return areOpen("event", state.currentSeason);
      },

      isFeedbackOpen(state) {
        return areOpen("feedback", state.currentSeason);
      },

      isScheduleShown(state) {
        return areOpen("schedule", state.currentSeason);
      },

      reservations(state) {
        return (
          state
            .reservations_
            .reduce((acc, x) => {
              acc[x.uid] = x;

              return acc;
            }, {} as Record<string, Reservation>)
        );
      },
    },

    actions: {
      setCurrentSeason(season?: Partial<ISeason> | null) {
        this.currentSeason = season || null;
      },
      setSeason(season?: Partial<ISeason> | null) {
        this.season = season || null;
      },
      setReservations(reservations: Reservation[]) {
        this.reservations_ = reservations;
      },
    },
  },
);
