import {
  formatDate,
} from "@/helpers/date";

type Image = {
  url: string,
  width: number,
};

export type News = Record<string, unknown> & {
  slug: string,
  title: string,
  description: string,
  date: string | Date,
  images: {
    thumb: Image,
    default: Image,
  },
  formattedDate?: string,
};

export const processNewsItem =
  (newsItem: News): News =>
    ({
      ...newsItem,
      formattedDate: formatDate(newsItem.date),
    })
;

export const processNews =
  (news: News[]): News[] =>
    news
      .map(processNewsItem)
;
