import type {
  ImageCropInput,
} from "~/graphql/client/graphql";

/** Square crop in source-image pixels (EXIF-oriented). */
export type ImageCrop = ImageCropInput;

/** What the circular cropper hands back on confirm. */
export type ImageCropResult = {
  /** The untouched original upload. */
  file: File,
  /** Null only when the image could not be decoded. */
  crop: ImageCrop | null,
  /** Small square render of the crop, for the input's preview. */
  preview: Blob,
};

const cropsByFile = new WeakMap<File, ImageCrop>();

export const setImageCrop = (file: File, crop: ImageCrop | null) => {
  if (crop) {
    cropsByFile.set(file, crop);
  } else {
    cropsByFile.delete(file);
  }
};

/** The crop picked for this file in a `cropCircle` file input, or null (also for existing-photo URL strings). */
export const imageCropFor = (file: unknown): ImageCrop | null =>
  "undefined" !== typeof File && file instanceof File
    ? cropsByFile.get(file) ?? null
    : null
;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || "object" !== typeof value) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  return null === proto || Object.prototype === proto;
};

/**
 * Copy of mutation variables where every object holding a cropped `photo` File
 * also carries its `photoCrop`, so the server can keep the original and crop the rest.
 * Returns the input unchanged when nothing was cropped.
 */
export const withPhotoCrops = <T>(variables: T): T => {
  let changed = false;

  const walk = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(walk);
    }

    if (!isPlainObject(value)) {
      return value;
    }

    const copy: Record<string, unknown> = {};
    for (const [ key, entry ] of Object.entries(value)) {
      copy[key] = walk(entry);
    }

    const crop = imageCropFor(value.photo);
    if (crop) {
      copy.photoCrop = crop;
      changed = true;
    }

    return copy;
  };

  const result = walk(variables) as T;

  return changed ? result : variables;
};
