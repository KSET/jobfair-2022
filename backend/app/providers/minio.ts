import {
  Client,
} from "minio";
import {
  captureError,
} from "../services/error-service";

export const BUCKET_NAME = process.env.MINIO_BUCKET ?? "";

export const minio = new Client({
  endPoint: process.env.MINIO_HOST ?? "",
  port: Number(process.env.MINIO_PORT ?? "9000"),
  accessKey: process.env.MINIO_USER ?? "",
  secretKey: process.env.MINIO_PASS ?? "",
  useSSL: "true" === process.env.MINIO_SSL,
});

export const init = async () => {
  const region = "us-east-1";

  const exists = await minio.bucketExists(BUCKET_NAME);

  if (exists) {
    return true;
  }

  try {
    await minio.makeBucket(BUCKET_NAME, region);
    return true;
  } catch (e) {
    captureError(e);
    return false;
  }
};
