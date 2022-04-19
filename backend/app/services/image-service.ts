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

export type ImageBase = Opaque<string, "MinioBaseImage">;

const FullDimensionsLimit: readonly [ number, number ] = [ 1920, 1920 ];

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

    const sharpBase =
      () =>
        sharp(
          {
            sequentialRead: true,
            animated: true,
          },
        )
          .withMetadata({
            exif: {
              IFD0: {
                UploadedTo: "Job Fair",
                UploadedBy: `${ user.firstName } ${ user.lastName }`,
              },
            },
          })
    ;

    const sharpThumb =
      sharpBase()
        .resize({
          width: 64,
          height: 64,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg()
    ;

    const sharpFull =
      (() => {
        switch (fileInfo.mimetype) {
          case "image/png":
            return (
              sharpBase()
                .resize({
                  width: FullDimensionsLimit[0],
                  height: FullDimensionsLimit[1],
                  fit: "inside",
                  withoutEnlargement: true,
                })
                .png({
                  compressionLevel: 9,
                  progressive: true,
                })
            );
          case "image/jpeg":
            return (
              sharpBase()
                .resize({
                  width: FullDimensionsLimit[0],
                  height: FullDimensionsLimit[1],
                  fit: "inside",
                  withoutEnlargement: true,
                })
                .jpeg({
                  quality: 91,
                  progressive: true,
                  optimiseScans: true,
                })
            );
          default:
            return (
              sharpBase()
                .resize({
                  width: FullDimensionsLimit[0],
                  height: FullDimensionsLimit[1],
                  fit: "inside",
                  withoutEnlargement: true,
                })
            );
        }
      })()
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

    const variations = [
      {
        name: "original",
        mimeType: fileInfo.mimetype,
        modifier: null,
      },
      {
        name: "full",
        mimeType: fileInfo.mimetype,
        modifier: sharpFull,
      },
      {
        name: "thumb",
        mimeType: "image/jpeg",
        modifier: sharpThumb,
      },
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
      return false;
    }
  }
}
