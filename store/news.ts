import {
  defineStore,
} from "pinia";
import {
  NewsWithDate,
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
      setNews<T extends NewsWithDate>(news: T[]) {
        this.items = news.map(processNewsItem);

        return this.items;
      },

      async fetchNews() {
        const translationsStore = useTranslationsStore();

        const resp = await useQuery<INewsQuery, INewsQueryVariables>({
          query: News,
          variables: {
            lang: translationsStore.currentLanguage,
          },
        })();

        const news = resp?.data?.news || [];

        return this.setNews(news);
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
