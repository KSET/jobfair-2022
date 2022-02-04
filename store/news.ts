import {
  defineStore,
} from "pinia";
import {
  processNewsItem,
} from "~/helpers/news";
import {
 useQuery,
} from "~/composables/useQuery";
import {
  INewsQuery,
  INewsQueryVariables,
  News,
  INewsItemQuery,
  INewsItemQueryVariables,
  NewsItem,
} from "~/graphql/schema";
import {
 useTranslationsStore,
} from "~/store/translations";

export const useNewsStore = defineStore(
  "news",
  {
    state: () => ({
      items: [],
    }),

    actions: {
      async fetchNews() {
        const translationsStore = useTranslationsStore();

        const resp = await useQuery<INewsQuery, INewsQueryVariables>({
          query: News,
          variables: {
            lang: translationsStore.currentLanguage,
          },
        })();

        const news = resp?.data?.news || [];

        return news.map(processNewsItem);
      },

      async fetchNewsItem(slug: string) {
        const resp = await useQuery<INewsItemQuery, INewsItemQueryVariables>({
          query: NewsItem,
          variables: {
            slug,
          },
        })();

        const news = resp?.data?.newsItem || null;

        return (
          news
            ? processNewsItem(news)
            : null
        );
      },
    },
  },
);
