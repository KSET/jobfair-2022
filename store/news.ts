import {
  defineStore,
} from "pinia";
import {
  NewsWithFormattedDate,
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
      items: [] as NewsWithFormattedDate[],
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

        this.items = news.map(processNewsItem);

        return this.items;
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
