import {
  defineStore,
} from "pinia";

export const useSettingsStore = defineStore(
  "settings",
  {
    state: () => ({
      settings: {} as Record<string, string>,
    }),

    getters: {
      getSetting(state) {
        return (
          (key: string, fallback = "") =>
            state.settings[key] === undefined
              ? fallback
              : state.settings[key]
        );
      },
    },
  },
);
