import {
  buffer as streamToBuffer,
} from "node:stream/consumers";
import {
  FileUpload,
} from "graphql-upload";
import {
  User,
} from "@prisma/client";
import {
  Opaque,
} from "type-fest";
import {
  extension as extensionFromMimeType,
} from "mime-types";
import sharp from "sharp";
import {
  clamp,
} from "rambdax";
import {
  BUCKET_NAME,
  minio,
} from "../providers/minio";
import {
  prisma as prismaClient,
} from "../providers/prisma";
import {
  captureError,
} from "./error-service";

export type ImageBase = Opaque<string, "MinioBaseImage">;

const DimensionsLimit = {
  full: {
    width: 1920,
    height: 1920,
  },
  thumb: {
    width: 64,
    height: 64,
  },
} as const;

type DimensionName = keyof typeof DimensionsLimit;

const Transparent = { r: 255, g: 255, b: 255, alpha: 0 } as const;

/** Square crop in source pixels, measured on the EXIF-oriented image (what browsers display). */
export type ImageCrop = {
  x: number,
  y: number,
  size: number,
};

type ImageRegion = {
  left: number,
  top: number,
  width: number,
  height: number,
};

/** Highest zoom the client cropper allows; keep in sync with MAX_ZOOM in app-image-cropper.vue. */
const MAX_CROP_ZOOM = 4;

const cropToRegion = async (input: Buffer, crop: ImageCrop): Promise<ImageRegion> => {
  const metadata = await sharp(input).metadata();
  const isRotated = 5 <= (metadata.orientation ?? 1);
  const width = (isRotated ? metadata.height : metadata.width) ?? 0;
  const height = (isRotated ? metadata.width : metadata.height) ?? 0;

  if (!width || !height) {
    throw new Error("Could not read image dimensions");
  }

  const shortSide = Math.min(width, height);
  const size = clamp(Math.ceil(shortSide / MAX_CROP_ZOOM), shortSide, Math.floor(crop.size));

  return {
    left: clamp(0, width - size, Math.round(crop.x)),
    top: clamp(0, height - size, Math.round(crop.y)),
    width: size,
    height: size,
  };
};

export class ImageService {
  public static async uploadImage(
    base: ImageBase,
    fileInfo: FileUpload,
    user: User,
    prisma: Pick<typeof prismaClient, "image"> = prismaClient,
    options: {
      crop?: ImageCrop | null,
    } = {},
  ) {
    const minioBase =
      (
        base.endsWith("/")
          ? base
          : `${ base }/`
      )
        .replace(/\/+$/g, "/")
        .replace(/^\/*/g, "")
    ;

    const minioKeyPrefix = `${ minioBase }${ new Date().toISOString() }.${ process.hrtime.bigint().toString(36) }`;

    const minioKeyFor =
      (name: string, ext: string) =>
        `${ minioKeyPrefix }/${ name }.${ ext }`
    ;

    const withOutputType =
      (
        sharp: sharp.Sharp,
        mimeType: string,
      ) => {
        switch (mimeType) {
          case "image/png":
            return (
              sharp
                .png({
                  compressionLevel: 9,
                  progressive: true,
                })
            );
          case "image/jpeg":
            return (
              sharp
                .jpeg({
                  quality: 91,
                  progressive: true,
                  optimiseScans: true,
                })
            );
          case "image/gif":
            return (
              sharp
                .gif({
                  loop: 0,
                })
            );
          default:
            return (
              sharp
            );
        }
      }
    ;

    const resized =
      (input: Buffer, size: DimensionName, mimeType: string, region: ImageRegion | null) =>
        withOutputType(
          (
            region
              ? sharp(input).rotate().extract(region)
              : sharp(input, { animated: true })
          )
            .resize({
              ...DimensionsLimit[size],
              fit: "inside",
              background: Transparent,
              withoutEnlargement: true,
            })
            .withMetadata({
              exif: {
                IFD0: {
                  UploadedTo: "Job Fair",
                  UploadedBy: `${ user.firstName } ${ user.lastName }`,
                },
              },
            }),
          mimeType,
        )
          .toBuffer()
    ;

    const uploadToMinio =
      async (name: string, mimeType: string, data: Buffer) => {
        const key = minioKeyFor(name, extensionFromMimeType(mimeType) || "bin");
        const { etag } = await minio.putObject(
          BUCKET_NAME,
          key,
          data,
          {
            mimeType,
          },
        );

        return {
          etag,
          minioKey: key,
          mimeType,
        };
      }
    ;

    try {
      // Read once: sharp buffers stream input anyway, and every variation needs the full image.
      const input = await streamToBuffer(fileInfo.createReadStream());
      const region = options.crop ? await cropToRegion(input, options.crop) : null;
      const mimeType = fileInfo.mimetype;

      const [
        minioOriginal,
        minioFull,
        minioThumb,
      ] =
          await Promise.all([
            uploadToMinio("original", mimeType, input),
            resized(input, "full", mimeType, region).then((data) => uploadToMinio("full", mimeType, data)),
            resized(input, "thumb", mimeType, region).then((data) => uploadToMinio("thumb", mimeType, data)),
          ])
      ;

      return prisma.image.create({
        data: {
          name: fileInfo.filename,
          uploader: {
            connect: {
              id: user.id,
            },
          },
          original: {
            create: minioOriginal,
          },
          full: {
            create: minioFull,
          },
          thumb: {
            create: minioThumb,
          },
        },
      });
    } catch (e) {
      captureError(e);
      return null;
    }
  }

  public static async deleteImage(
    uid: string,
    user: User,
    prisma: Pick<typeof prismaClient, "image" | "imageVariation"> = prismaClient,
  ) {
    const image = await prisma.image.findFirst({
      where: {
        uid,
      },
      select: {
        original: {
          select: {
            id: true,
            minioKey: true,
          },
        },
        full: {
          select: {
            id: true,
            minioKey: true,
          },
        },
        thumb: {
          select: {
            id: true,
            minioKey: true,
          },
        },
      },
    });

    if (!image) {
      return false;
    }

    const keys = [
      image.original.minioKey,
      image.full.minioKey,
      image.thumb.minioKey,
    ] as const;

    const deleteFromMinio =
      (key: string) =>
        minio
          .removeObject(BUCKET_NAME, key)
          .then(() => true)
          .catch(() => false)
    ;

    try {
      await Promise.all(keys.map((key) => deleteFromMinio(key)));

      await prisma.image.delete({
        where: {
          uid,
        },
      });

      return true;
    } catch (e) {
      captureError(e);
      return false;
    }
  }
}
