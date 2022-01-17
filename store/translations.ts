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
} from "~/helpers/string";
import {
  ITranslationsForQuery,
  ITranslationsForQueryVariables,
  IUpdateTranslationMutation,
  IUpdateTranslationMutationVariables,
  TranslationsFor,
  UpdateTranslation,
} from "~/graphql/schema";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";

export enum Language {
  EN = "en_US",
  HR = "hr_HR",
}

export type Translations = Partial<Record<Language, Record<string, string>>>;

export const useTranslationsStore = defineStore(
  "translations",
  {
    state: () => ({
      translations: {} as Translations,
      isEditable: false,
      currentLanguage: Language.HR,
    }),

    getters: {
      translation(state) {
        return (key: string) => state.translations[state.currentLanguage]?.[key] ?? key;
      },

      capitalizedTranslation(): (key: string) => string {
        return pipe(
          (key: string) => this.translation(key),
          split(" "),
          map(capitalize),
          join(" "),
        );
      },
    },

    actions: {
      async setCurrentLanguage(language: Language) {
        try {
          await this.fetchTranslations(language);
          this.currentLanguage = language;
        } catch {
        }

        return this.currentLanguage;
      },

      async updateTranslation(
        {
          key,
          value,
          language,
        }: {
          key: string,
          value: string,
          language?: Language,
        },
      ) {
        if (!language) {
          language = this.currentLanguage;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const resp = await useMutation<IUpdateTranslationMutation, IUpdateTranslationMutationVariables>(UpdateTranslation)({
          data: {
            key,
            value,
            language,
          },
        });

        const translation = resp.data?.updateTranslation;

        if (!translation) {
          return null;
        }

        const respLanguage = translation.language as Language;

        if (!(respLanguage in this.translations)) {
          this.translations[respLanguage] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.translations[respLanguage]![translation.key] = translation.value;
        return {
          error: false,
          errorData: [] as string[],
          language,
        };
      },

      setTranslations(translationList: { key: string, value: string, }[], language?: Language) {
        const lang = language ?? this.currentLanguage;

        this.translations[lang] = Object.fromEntries(
          translationList.map((x) => [ x.key, x.value ]),
        );

        return this.translations;
      },

      async fetchTranslations(language?: Language) {
        const lang = language ?? this.currentLanguage;
        const translationsQuery = await useQuery<ITranslationsForQuery, ITranslationsForQueryVariables>({
          query: TranslationsFor,
          variables: {
            language: lang,
          },
        })();

        const translationList =
          translationsQuery.data?.allTranslationsFor ?? [] as ITranslationsForQuery["allTranslationsFor"]
        ;

        return this.setTranslations(translationList, lang);
      },
    },
  },
);
