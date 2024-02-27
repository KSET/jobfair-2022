import {
  type Simplify,
} from "type-fest";
import {
  type IPartner,
  type IImage,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";

export type Partner = Pick<IPartner,
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
export const partnerCreate =
  <T extends Partner>(partner?: T | null): Record<keyof Partner, InputEntry> =>
    ({
      name: {
        value: partner?.name || "",
        type: "text" as const,
        placeholder: "Ime partnera",
      },
      url: {
        value: partner?.url || "",
        type: "url" as const,
        placeholder: "https://example.com",
      },
      photo: {
        value: partner?.photo?.uid ? `/api/i/${ partner.photo.uid }/full` : "",
        fileName: partner?.photo?.name,
        fileType: partner?.photo?.full?.mimeType,
        accept: "image/png,image/jpeg",
        type: "file",
      },
    })
;
