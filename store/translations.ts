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
  type IReportMissingTranslationsMutation,
  type IReportMissingTranslationsMutationVariables,
  type ITranslationsForQuery,
  type ITranslationsForQueryVariables,
  type IUpdateTranslationMutation,
  type IUpdateTranslationMutationVariables,
  ReportMissingTranslations,
  TranslationsFor,
  UpdateTranslation,
} from "~/graphql/schema";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  useUserStore,
} from "~/store/user";

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

const MISSING_REPORT_DELAY_MS = 2000;
const MISSING_REPORT_BATCH_SIZE = 50;
const MISSING_KEY_MAX_LENGTH = 200;
const TRANSLATION_KEY_FORMAT = /^[\w-]+(?:\.[\w-]+)+$/;
const reportedMissingKeys = new Set<string>();
const pendingMissingKeys = new Set<string>();
let missingReportTimer: ReturnType<typeof setTimeout> | null = null;

const flushMissingTranslations = () => {
  missingReportTimer = null;
  const keys = Array.from(pendingMissingKeys);
  pendingMissingKeys.clear();

  for (let i = 0; i < keys.length; i += MISSING_REPORT_BATCH_SIZE) {
    void useMutation<IReportMissingTranslationsMutation, IReportMissingTranslationsMutationVariables>(ReportMissingTranslations)({
      keys: keys.slice(i, i + MISSING_REPORT_BATCH_SIZE),
    }).catch(() => null);
  }
};

const isReportableKey = (key: string) => MISSING_KEY_MAX_LENGTH >= key.length && TRANSLATION_KEY_FORMAT.test(key);

const queueMissingTranslation = (key: string) => {
  if (!import.meta.client || reportedMissingKeys.has(key) || !isReportableKey(key)) {
    return;
  }

  const userStore = useUserStore();
  if (!userStore.isAdmin && !userStore.isAccountManager) {
    return;
  }

  reportedMissingKeys.add(key);
  pendingMissingKeys.add(key);

  if (!missingReportTimer) {
    missingReportTimer = setTimeout(
      () => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(flushMissingTranslations, { timeout: MISSING_REPORT_DELAY_MS });
        } else {
          flushMissingTranslations();
        }
      },
      MISSING_REPORT_DELAY_MS,
    );
  }
};

export const useTranslationsStore = defineStore(
  "translations",
  {
    state: () => ({
      translations: {} as Translations,
      translationsLoading: {} as Partial<Record<Language, Record<string, boolean>>>,
      translationsLoaded: {} as Partial<Record<Language, boolean>>,
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

          if (!translations) {
            return false;
          }

          return (
            state.isEditable
              ? key in translations
              : Boolean(translations[key])
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
      reportIfMissing(key: string) {
        const language = this.currentLanguage;
        const translations = this.translations[language];

        if (!this.translationsLoaded[language] || !translations || key in translations) {
          return;
        }

        queueMissingTranslation(key);
      },

      setLanguageFromCookie() {
        this.currentLanguage = cookieLanguage().value || Language.HR;
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
        this.translationsLoaded[lang] = 0 < translationList.length;

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
