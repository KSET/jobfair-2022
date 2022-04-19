import {
  defineStore,
} from "pinia";
import {
  ISeason,
} from "~/graphql/schema";

export const useSeasonsStore = defineStore(
  "seasons",
  {
    state: () => ({
      season: null as (Partial<ISeason> | null),
      currentSeason: null as (Partial<ISeason> | null),
    }),

    getters: {
      applicationsOpen(state) {
        if (!state.currentSeason) {
          return false;
        }

        const now = new Date();
        const from = new Date(state.currentSeason.applicationsFrom as string);
        const until = new Date(state.currentSeason.applicationsUntil as string);

        return from < now && now < until;
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
