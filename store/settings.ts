import {
  defineStore,
} from "pinia";

export const useSettingsStore = defineStore(
  "settings",
  {
    state: () => ({
      settings: {
        "Instagram URL": "https://www.instagram.com/jobfairfer/",
        "Facebook URL": "https://fb.com/JobFair.FER",
        "Youtube URL": "https://youtube.com/c/jobfairfer",
        "LinkedIn URL": "https://linkedin.com/company/jobfairfer",
      } as Record<string, string>,
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
