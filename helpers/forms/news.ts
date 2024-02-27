import {
  toPairs,
} from "rambdax";
import {
  asDate,
} from "../date";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
import {
  type IImage,
  type INews,
} from "~/graphql/schema";
import {
  Language,
} from "~/store/translations";

type Photo =
  Pick<IImage,
    "uid"
    | "name">
  & {
  full: Pick<IImage["full"], "mimeType">,
};

type News = Omit<INews,
  "uid"
  | "slug"
  | "author"
  | "createdAt"
  | "updatedAt"
  | "photo"
  | "_count"> & {
  photo?: Photo | null,
};

export const newsEdit =
  <T extends News>(news?: T | null): Record<keyof News, InputEntry> =>
    ({
      title: {
        value: news?.title || "",
        type: "text",
        placeholder: "Title",
      },
      lang: {
        value: news?.lang || Language.HR,
        type: "dropdown",
        options: toPairs(Language).map(([ label, value ]) => ({
          label,
          value,
        })),
      },
      date: {
        value: asDate(news?.date),
        type: "date",
        placeholder: "Date",
      },
      photo: {
        value: news?.photo?.uid ? `/api/i/${ news.photo.uid }/full` : "",
        fileName: news?.photo?.name,
        fileType: news?.photo?.full?.mimeType,
        accept: "image/png,image/jpeg",
        type: "file",
      },
      description: {
        value: news?.description || "",
        type: "text",
        placeholder: "Description",
      },
      content: {
        value: news?.content || "",
        type: "editor",
        placeholder: "Content",
      },
    })
;
