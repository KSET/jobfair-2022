import { FileUpload } from "graphql-upload";
import { ImageBase, ImageService } from "../../services/image-service";
import { User } from "@prisma/client";

export const photoMimeTypes = new Set([
  "image/png",
  "image/jpeg",
]);

export const photoExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
];


export async function createPhoto (
  photoFile: FileUpload | null,
  oldPhoto: { id: number, } | null,
  base: ImageBase,
  user: User,
): Promise<[ string, null ] | [ null, number ]> {
  if (photoFile) {
    if (
      false //!photoMimeTypes.has(photoFile?.mimetype)
      || !photoExtensions.some((ext) => photoFile.filename.toLowerCase().endsWith(ext))
    ) {
      return [
        `File must have extension: ${ photoExtensions.join(", ") }`,
        null,
      ];
    }

    const photo = await ImageService.uploadImage(
      base,
      photoFile,
      user,
    );

    if (!photo) {
      return [
        "Something went wrong",
        null,
      ];
    }

    return [
      null,
      photo.id,
    ];
  }

  if (oldPhoto) {
    return [
      null,
      oldPhoto.id,
    ];
  }

  return [
    "Photo is required",
    null,
  ];
}
;