import {
  formatDate,
} from "@/helpers/date";

export type News = Record<string, unknown> & { date: string | Date, formattedDate?: string };

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
