import {
  IPressRelease,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";

type PressRelease = Omit<IPressRelease,
  "createdAt"
  | "uid"
  | "updatedAt">;
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
            ? new Date(pressRelease?.published as (Date | string)).toISOString()
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
