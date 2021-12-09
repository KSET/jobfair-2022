import {
  defineStore,
} from "pinia";

export type Translations = Record<string, string>;

export const useTranslationsStore = defineStore(
  "translations",
  {
    state: () => ({
      translations: {} as Translations,
      isEditable: false,
    }),

    getters: {
      translation(state) {
        return (key: string) => state.translations[key] || key;
      },
    },

    actions: {
      async updateTranslation(
        {
          key,
          value,
        }: {
          key: string,
          value: string,
        },
      ) {
        await Promise.resolve();
        this.translations[key] = value;
        return {
          error: false,
          errorData: [] as string[],
        };
      },
    },
  },
);
