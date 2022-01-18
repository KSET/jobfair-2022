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
      translationsLoading: {} as Partial<Record<Language, Record<string, boolean>>>,
      isEditable: false,
      currentLanguage: Language.HR,
    }),

    getters: {
      translation(state): (key: string, language?: Language) => string {
        return (key: string, language?: Language) => state.translations[language ?? state.currentLanguage]?.[key] ?? key;
      },

      translationLoading(state): (key: string, language?: Language) => boolean {
        return (key: string, language?: Language): boolean => state.translationsLoading[language ?? state.currentLanguage]?.[key] ?? false;
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

        const langLoading = this.translationsLoading[language];
        if (langLoading) {
          langLoading[key] = true;
        }
        const resp = await useMutation<IUpdateTranslationMutation, IUpdateTranslationMutationVariables>(UpdateTranslation)({
          data: {
            key,
            value,
            language,
          },
        }).catch(() => null);
        if (langLoading) {
          langLoading[key] = false;
        }

        const translation = resp?.data?.updateTranslation;

        if (!translation) {
          return false;
        }

        const respLanguage = translation.language as Language;

        if (!(respLanguage in this.translations)) {
          this.translations[respLanguage] = {};
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.translations[respLanguage]![translation.key] = translation.value;

        return true;
      },

      setTranslations(translationList: { key: string, value: string, }[], language?: Language) {
        const lang = language ?? this.currentLanguage;

        this.translations[lang] = Object.fromEntries(
          translationList.map((x) => [ x.key, x.value ]),
        );
        this.translationsLoading[lang] = Object.fromEntries(
          translationList.map((x) => [ x.key, false ]),
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
