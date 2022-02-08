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

    actions: {
      setCurrentSeason(season?: ISeason | null) {
        this.currentSeason = season || null;
      },
    },
  },
);
