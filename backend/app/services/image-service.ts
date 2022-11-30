import {
  Readable,
} from "stream";
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

export class ImageService {
  public static async uploadImage(
    base: ImageBase,
    fileInfo: FileUpload,
    user: User,
    prisma: Pick<typeof prismaClient, "image"> = prismaClient,
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

    const sharpFor =
      <Size extends string>(size: Size, mimeType: string) =>
        (
          !(size in DimensionsLimit)
            ? null
            : withOutputType(
              sharp({
                sequentialRead: true,
                animated: true,
              })
                .resize({
                  ...DimensionsLimit[size as DimensionName],
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
        ) as (Size extends DimensionName ? sharp.Sharp : null)
    ;

    const uploadToMinio =
      async (name: string, mimeType: string, stream: string | Buffer | Readable) => {
        const key = minioKeyFor(name, extensionFromMimeType(mimeType) || "bin");
        const { etag } = await minio.putObject(
          BUCKET_NAME,
          key,
          stream,
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

    function variation<Name extends string>(name: Name, mimeType: string) {
      return {
        name,
        mimeType,
        modifier: sharpFor(name, mimeType),
      };
    }

    const variations = [
      variation("original", fileInfo.mimetype),
      variation("full", fileInfo.mimetype),
      variation("thumb", fileInfo.mimetype),
    ] as const;

    try {
      const [
        minioOriginal,
        minioFull,
        minioThumb,
      ] =
          await Promise.all(
            variations
              .map((v) =>
                uploadToMinio(
                  v.name,
                  v.mimeType,
                  v.modifier
                    ? fileInfo.createReadStream().pipe(v.modifier)
                    : fileInfo.createReadStream()
                  ,
                ),
              ),
          )
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
