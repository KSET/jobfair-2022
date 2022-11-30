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
  INewsFilter,
  INewsItemByUidQuery,
  INewsItemByUidQueryVariables,
  NewsItemByUid,
} from "~/graphql/schema";
import {
  useTranslationsStore,
} from "~/store/translations";

export const useNewsStore = defineStore(
  "news",
  {
    state: () => ({
      items: [] as NewsWithFormattedDate[],
      item: null as NewsWithFormattedDate | null,
    }),

    actions: {
      setNews<T extends NewsWithDate>(news: T[]) {
        this.items = news.map(processNewsItem);

        return this.items;
      },

      setNewsItem<T extends NewsWithDate>(news: T | null) {
        this.item =
          news
            ? processNewsItem(news)
            : news
        ;

        return this.item;
      },

      async fetchNews(filter: INewsFilter = {}) {
        const translationsStore = useTranslationsStore();

        const resp = await useQuery<INewsQuery, INewsQueryVariables>({
          query: News,
          variables: {
            lang: translationsStore.currentLanguage,
            filter,
          },
        })();

        const news = resp?.data?.news || [];

        return this.setNews(news);
      },

      async fetchNewsItem(slug: string, filter: INewsFilter = {}) {
        const translationsStore = useTranslationsStore();

        const resp = await useQuery<INewsItemQuery, INewsItemQueryVariables>({
          query: NewsItem,
          variables: {
            slug,
            lang: translationsStore.currentLanguage,
            filter,
          },
        })().then((resp) => resp?.data || null);

        if (!resp) {
          return {
            newsItem: null,
            news: [],
          };
        }

        const {
          newsItem,
          news,
        } = resp;

        return {
          newsItem: newsItem ? processNewsItem(newsItem) : null,
          news: this.setNews(news),
        };
      },

      async fetchNewsItemByUid(uid: string) {
        const resp = await useQuery<INewsItemByUidQuery, INewsItemByUidQueryVariables>({
          query: NewsItemByUid,
          variables: {
            uid,
          },
        })().then((resp) => resp?.data ?? null);

        return this.setNewsItem(resp?.newsItemByUid ?? null);
      },
    },
  },
);
