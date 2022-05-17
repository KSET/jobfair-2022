import {
  defineStore,
} from "pinia";
import {
  ISeason,
} from "~/graphql/schema";
import {
  WithoutSuffix,
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

export const useSeasonsStore = defineStore(
  "seasons",
  {
    state: () => ({
      season: null as (Partial<ISeason> | null),
      currentSeason: null as (Partial<ISeason> | null),
    }),

    getters: {
      applicationsOpen(state) {
        return areOpen("applications", state.currentSeason);
      },

      areParticipantsShown(state) {
        return areOpen("showParticipants", state.currentSeason);
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
    },

    actions: {
      setCurrentSeason(season?: Partial<ISeason> | null) {
        this.currentSeason = season || null;
      },
      setSeason(season?: Partial<ISeason> | null) {
        this.season = season || null;
      },
    },
  },
);
