import {
  type Simplify,
} from "type-fest";
import {
  type ISponsor,
  type IImage,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.vue";

export type Sponsor = Pick<ISponsor,
  "name"
  | "url"> & {
  photo?: (
    Simplify<Pick<IImage,
        "uid"
        | "name">
      & {
      full: Pick<IImage["full"], "mimeType">,
    }>
    ) | null,
};
export const sponsorCreate =
  <T extends Sponsor>(sponsor?: T | null): Record<keyof Sponsor, InputEntry> =>
    ({
      name: {
        value: sponsor?.name || "",
        type: "text" as const,
        placeholder: "Ime sponzora",
      },
      url: {
        value: sponsor?.url || "",
        type: "url" as const,
        placeholder: "https://example.com",
      },
      photo: {
        value: sponsor?.photo?.uid ? `/api/i/${ sponsor.photo.uid }/full` : "",
        fileName: sponsor?.photo?.name,
        fileType: sponsor?.photo?.full?.mimeType,
        accept: "image/png,image/jpeg",
        type: "file",
      },
    })
;
