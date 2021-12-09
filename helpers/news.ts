import {
  formatDate,
} from "@/helpers/date";
import {
  limitLength,
} from "@/helpers/data";

export type News = Record<string, unknown> & { date: string };

export const processNewsItem =
  (
    {
      date = "",
      ...newsItem
    }: News,
  ): News =>
    ({
      ...newsItem,
      date: formatDate(date),
    })
;

export const processNews =
  (news: News[]): News[] =>
    limitLength(3)(
      news
        .map(processNewsItem)
      ,
    )
;
