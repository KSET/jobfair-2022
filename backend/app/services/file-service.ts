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
  tap,
} from "rambdax";
import {
  prisma as prismaClient,
} from "../providers/prisma";
import {
  BUCKET_NAME,
  minio,
} from "../providers/minio";
import {
  encodeRFC5987ValueChars,
} from "../helpers/string";
import {
  EventsService,
} from "./events-service";
import {
  captureError,
} from "./error-service";

export type MinioBase = Opaque<string, "MinioBase">;

export class FileService {
  public static async uploadFile(
    base: MinioBase,
    fileInfo: FileUpload,
    user: User,
    prisma: Pick<typeof prismaClient, "file"> = prismaClient,
  ) {
    try {
      const minioBase = (base.endsWith("/") ? base : `${ base }/`).replace(/\/+$/g, "/").replace(/^\/*/g, "");
      const minioKey = `${ minioBase }${ Date.now().toString(36) }.${ process.hrtime.bigint().toString(36) }.${ fileInfo.filename }`;

      const minioUpload = await minio.putObject(
        BUCKET_NAME,
        minioKey,
        fileInfo.createReadStream(),
        {
          name: encodeRFC5987ValueChars(fileInfo.filename),
          mimeType: fileInfo.mimetype,
        },
      );

      return prisma.file.create({
        data: {
          name: fileInfo.filename,
          mimeType: fileInfo.mimetype,
          minioKey,
          etag: minioUpload.etag,
          size: 0,
          uploader: {
            connect: {
              id: user.id,
            },
          },
        },
      }).then(tap(() => void EventsService.logEvent("file:upload", user.id, { key: minioKey })));
    } catch (e) {
      captureError(e);

      return null;
    }
  }

  public static async deleteFile(minioKey: string, user: User) {
    try {
      await minio.removeObject(BUCKET_NAME, minioKey);

      void EventsService.logEvent("file:delete", user.id, { key: minioKey });

      return true;
    } catch (e) {
      captureError(e);

      return false;
    }
  }
}
