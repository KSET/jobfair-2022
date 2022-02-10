import {
  Writable,
} from "stream";
import {
  BUCKET_NAME,
  minio,
} from "../providers/minio";

export const pipeFileInto =
  async (key: string, stream: Writable): Promise<boolean> => {
    try {
      const minioFile = await minio.getObject(BUCKET_NAME, key);

      return new Promise((resolve) => {
        try {
          minioFile.pipe(stream);

          minioFile.on("end", () => {
            resolve(true);
          });

          minioFile.on("error", () => {
            resolve(true);
          });
        } catch {
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  }
;
