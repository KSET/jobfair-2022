import {
  defineStore,
} from "pinia";
import {
  join,
  map,
  pipe,
  split,
} from "rambda";
import {
  capitalize,
} from "lodash-es";
import {
  unref,
} from "vue";
import {
 MaybeRef,
} from "@vueuse/shared";

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

      capitalizedTranslation(): (key: MaybeRef<string>) => string {
        return pipe(
          unref,
          (key: string) => this.translation(key),
          split(" "),
          map(capitalize),
          join(" "),
        );
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
