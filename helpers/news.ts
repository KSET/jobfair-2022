import {
  formatDate,
} from "@/helpers/date";
import {
  INews,
} from "~/graphql/schema";
import {
 RecursivePartial,
} from "~/helpers/type";

export type NewsWithDate = RecursivePartial<INews> & { date: unknown, };
export type NewsWithFormattedDate<T = NewsWithDate> = T & { date: Date, formattedDate: string, };

export const processNewsItem =
  <T extends NewsWithDate>(newsItem: T): NewsWithFormattedDate<T> =>
    ({
      ...newsItem,
      date: new Date(String(newsItem.date)),
      formattedDate: formatDate(new Date(String(newsItem.date))),
    })
;

export const processNews =
  <T extends Partial<INews> & { date: unknown, }>(news: T[]): NewsWithFormattedDate<T>[] =>
    news
      .map(processNewsItem)
;
