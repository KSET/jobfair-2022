import {
 type,
} from "rambda";
import {
  dotGet,
} from "@/helpers/data";

type ImageVariation = {
  width: number,
  url: string,
};

type Image = {
  original: ImageVariation,
  [size: string]: ImageVariation,
};

export const getSrcSet = (imageList: ImageVariation[]) => {
  if ("Object" !== type(imageList)) {
    return imageList;
  }

  return (
    Object
      .values(imageList)
      .map(
        ({
          width,
          url,
        }) =>
          `${ url } ${ width }w`
        ,
      )
      .join(",")
  );
};

export const getSrcWithWidth =
  (
    images: Image,
    minWidth: number,
  ) => {
    const defaultSrc = (): string => dotGet(images, "original.url", "");
    const candidateImage =
      Object
        .values(images)
        .sort(
          (a, b) =>
            a.width - b.width
          ,
        )
        .find(
          ({ width }) =>
            width >= minWidth
          ,
        )
    ;

    return dotGet(candidateImage, "url", defaultSrc);
  }
;

export const EXTENSION_MAP = {
  "image/gif": "gif",
  "image/png": "png",
  "image/jpeg": "jpg",
};
export const ALLOWED_MIME_TYPES = Object.keys(EXTENSION_MAP);

export const MAX_IMAGE_SIZE__MB = 7;
export const MAX_IMAGE_SIZE__KB = MAX_IMAGE_SIZE__MB * 1000;
export const MAX_IMAGE_SIZE__B = MAX_IMAGE_SIZE__KB * 1000;

export const bytesToHumanReadable =
  (bytes: number): string => {
    const step = 1000;

    if (Math.abs(bytes) < step) {
      return `${ bytes } B`;
    }

    const units = [ "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB" ];
    let u = -1;
    const r = 10 ** 1;

    do {
      bytes /= step;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= step && u < units.length - 1);

    return `${ bytes.toFixed(1) } ${ units[u] }`;
  }
;
