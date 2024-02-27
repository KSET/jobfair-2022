import {
  asDate,
} from "../date";
import {
  type IFile,
  type IPressRelease,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";

type PressRelease = Omit<IPressRelease,
    "createdAt"
    | "uid"
    | "file"
    | "forSeason"
    | "updatedAt">
  & {
  file?: Pick<IFile,
    "uid"
    | "name"
    | "mimeType"> | null,
}
  ;
export const pressReleaseCreate =
  <T extends PressRelease>(pressRelease?: T | null): Record<keyof PressRelease | "file", InputEntry> =>
    ({
      title: {
        value: pressRelease?.title ?? "",
        type: "text" as const,
      },
      published: {
        value:
          pressRelease?.published
            ? asDate(pressRelease?.published)
            : "",
        type: "date" as const,
      },
      file: {
        value: pressRelease?.file?.uid ? `/api/file/${ pressRelease.file.uid }` : "",
        fileName: pressRelease?.file?.name,
        fileType: pressRelease?.file?.mimeType,
        type: "file" as const,
      },
    })
;
