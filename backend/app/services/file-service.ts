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
  prisma,
} from "../providers/prisma";
import {
  BUCKET_NAME,
  minio,
} from "../providers/minio";
import {
  EventsService,
} from "./events-service";

export type MinioBase = Opaque<string, "MinioBase">;

export class FileService {
  public static async uploadFile(base: MinioBase, fileInfo: FileUpload, user: User) {
    try {
      const minioBase = (base.endsWith("/") ? base : `${ base }/`).replace(/\/+$/g, "/").replace(/^\/*/g, "");
      const minioKey = `${ minioBase }${ Date.now().toString(36) }.${ process.hrtime.bigint().toString(36) }.${ fileInfo.filename }`;

      const minioUpload = await minio.putObject(
        BUCKET_NAME,
        minioKey,
        fileInfo.createReadStream(),
        {
          name: fileInfo.filename,
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
    } catch {
      return null;
    }
  }

  public static async deleteFile(minioKey: string, user: User) {
    try {
      await minio.removeObject(BUCKET_NAME, minioKey);

      void EventsService.logEvent("file:delete", user.id, { key: minioKey });

      return true;
    } catch (e) {
      console.log(e);

      return false;
    }
  }
}
