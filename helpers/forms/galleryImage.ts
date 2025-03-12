import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
import {
  type IImage,
  type IGalleryImage,
} from "~/graphql/schema";

type Photo =
  Pick<IImage,
    "uid"
    | "name">
  & {
  full: Pick<IImage["full"], "mimeType">,
};

type GalleryImage = Omit<IGalleryImage,
  "uid"
  | "order"
  | "photo"> & {
  photo?: Photo | null,
};

export const galleryImageCreate =
  <T extends GalleryImage>(galleryImage?: T | null): Record<keyof GalleryImage, InputEntry> =>
    ({
      name: {
        value: galleryImage?.name || "",
        type: "text",
        placeholder: "Title",
      },
      photo: {
        value: galleryImage?.photo?.uid ? `/api/i/${ galleryImage.photo?.uid }/full` : "",
        fileName: galleryImage?.photo?.name,
        fileType: galleryImage?.photo?.full?.mimeType,
        accept: "image/png,image/jpeg",
        type: "file",
      },
      visible: {
        value: galleryImage?.visible ?? false,
        type: "checkbox" as const,
        required: false,
      },
    });

