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
      currentSeason: null as (ISeason | null),
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
      setCurrentSeason(season?: ISeason | null) {
        this.currentSeason = season || null;
      },
    },
  },
);
