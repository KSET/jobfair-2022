import {
  defineStore,
} from "pinia";
import {
  join,
  map,
  pipe,
  split,
  omit,
} from "rambda";
import {
  unref,
} from "vue";
import {
  fromPairs,
  toPairs,
} from "rambdax";
import {
  useCookie,
} from "#app";
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

export const LanguageToName = fromPairs(toPairs(Language).map(([ a, b ]) => [ b, a ])) as Record<Language, keyof typeof Language>;

export const LanguageISO: Record<Language, string> = {
  [Language.EN]: "en-US",
  [Language.HR]: "hr-HR",
};

const cookieLanguage = () => useCookie<Language>(
  "jobfair-lang",
  {
    expires: new Date(new Date().setMonth(new Date().getMonth() + 12)),
    path: "/",
  },
);

export type Translations = Partial<Record<Language, Record<string, string>>>;

export const useTranslationsStore = defineStore(
  "translations",
  {
    state: () => ({
      translations: {} as Translations,
      translationsLoading: {} as Partial<Record<Language, Record<string, boolean>>>,
      isEditable: false,
      isLoading: false,
      currentLanguage: Language.HR,
    }),

    getters: {
      currentLanguageIso: (state) => LanguageISO[state.currentLanguage],

      translation(state): (key: string, language?: Language) => string {
        return (key: string, language?: Language) => state.translations[language ?? state.currentLanguage]?.[key] || key;
      },

      hasTranslation(state): (key: string, language?: Language) => boolean {
        return (key: string, language?: Language) => {
          const translations = state.translations[language ?? state.currentLanguage];

          return (
            translations
              ? key in translations
              : false
          );
        };
      },

      translateFor() {
        return (
          <TKey extends string, TItem extends Record<`${ TKey }En` | `${ TKey }Hr`, any>>(
            item: TItem,
            key: TKey,
          ) => {
            type TItemValue = TItem[`${ TKey }Hr` | `${ TKey }En`];

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return (
              this.currentLanguage === Language.HR
                ? item[`${ key }Hr`]
                : item[`${ key }En`]
            ) as TItemValue;
          }
        );
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

      otherLanguages(): Language[] {
        return Object.values(
          omit(
            [
              LanguageToName[this.currentLanguage],
            ] as unknown as Language[],
            Language,
          ),
        );
      },
    },

    actions: {
      setLanguageFromCookie() {
        this.currentLanguage = unref(cookieLanguage()) || Language.HR;
      },

      async setCurrentLanguage(language: Language) {
        const cookie = cookieLanguage();
        try {
          await this.fetchTranslations(language);
          this.currentLanguage = language;
          cookie.value = language;
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
        });
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

        this.isLoading = true;
        const translationsQuery = await useQuery<ITranslationsForQuery, ITranslationsForQueryVariables>({
          query: TranslationsFor,
          variables: {
            language: lang,
          },
        })();

        const translationList =
          translationsQuery?.data?.allTranslationsFor ?? [] as ITranslationsForQuery["allTranslationsFor"]
        ;

        this.setTranslations(translationList, lang);
        this.isLoading = false;

        return this.translations;
      },
    },
  },
);
