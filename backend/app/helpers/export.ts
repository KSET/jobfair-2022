import {
  Readable,
} from "node:stream";
import {
  buffer as streamToBuffer,
} from "node:stream/consumers";
import {
  pipeline,
} from "node:stream/promises";
import type JSZip from "jszip";
import type {
  Response,
} from "express";
import contentDisposition from "content-disposition";
import {
  BUCKET_NAME,
  minio,
} from "../providers/minio";
import {
  captureError,
} from "../services/error-service";

export const extFromMime = (mime: string): string => {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "application/postscript": "eps",
  };
  return map[mime] ?? mime.split("/").pop()?.replace("+xml", "") ?? "bin";
};

// GET reports a missing key as NoSuchKey (from the XML body), HEAD/stat as NotFound
const isMissingObjectError = (e: unknown): boolean => {
  const code = (e as { code?: unknown, } | null)?.code;
  return "NoSuchKey" === code || "NotFound" === code;
};

/**
 * Resolves to null when the object does not exist; any other MinIO error is rethrown.
 */
export const loadObject = async (minioKey: string): Promise<Buffer | null> => {
  try {
    return await streamToBuffer(await minio.getObject(BUCKET_NAME, minioKey));
  } catch (e) {
    if (isMissingObjectError(e)) {
      return null;
    }
    throw e;
  }
};


export const objectExists = async (minioKey: string): Promise<boolean> => {
  try {
    await minio.statObject(BUCKET_NAME, minioKey);
    return true;
  } catch (e) {
    if (isMissingObjectError(e)) {
      return false;
    }
    throw e;
  }
};


export const lazyStream = (open: () => Promise<Readable>): Readable => {
  let source: Readable | undefined;
  let opening = false;

  const stream: Readable = new Readable({
    read() {
      if (source) {
        source.resume();
        return;
      }

      if (opening) {
        return;
      }
      opening = true;

      open().then(
        (s) => {
          if (stream.destroyed) {
            s.destroy();
            return;
          }

          source = s;
          s.on("data", (chunk: Buffer) => {
            if (!stream.push(chunk)) {
              s.pause();
            }
          });
          s.once("end", () => stream.push(null));
          s.once("error", fail);
        },
        fail,
      );
    },
    destroy(err, callback) {
      source?.destroy();
      callback(err);
    },
  });

  function fail(e: Error) {
    if (stream.isPaused()) {
      stream.once("resume", () => fail(e));
      return;
    }

    stream.emit("error", e);
    stream.destroy();
  }

  return stream;
};

export const lazyObjectStream = (minioKey: string): Readable =>
  lazyStream(() => minio.getObject(BUCKET_NAME, minioKey))
;

export const mapWithConcurrency = async <T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let next = 0;

  const worker = async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i]);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));

  return results;
};

export const truncateBytes = (str: string, maxBytes: number): string => {
  let out = "";
  let bytes = 0;

  for (const char of str) {
    const size = Buffer.byteLength(char);
    if (bytes + size > maxBytes) {
      break;
    }
    out += char;
    bytes += size;
  }

  return out;
};

// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[/\\:*?"<>|\u0000-\u001F\u007F]/g;

export const safeName = (name: string, maxBytes: number, fallback = "file"): string =>
  truncateBytes(
    name
      .replace(UNSAFE_CHARS, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\.+/, ""),
    maxBytes,
  ).trim()
  || fallback
;

/**
 * Returns a function producing zip paths that are unique case-insensitively,
 * appending " (2)", " (3)", ... on collision.
 */
export const uniqueZipPaths = () => {
  const used = new Set<string>();

  return (folder: string, baseName: string, ext: string): string => {
    const prefix = folder ? `${ folder }/` : "";
    let path = `${ prefix }${ baseName }.${ ext }`;
    for (let n = 2; used.has(path.toLowerCase()); n += 1) {
      path = `${ prefix }${ baseName } (${ n }).${ ext }`;
    }
    used.add(path.toLowerCase());
    return path;
  };
};

export const sendZip = async (res: Response, zip: JSZip, filename: string): Promise<void> => {
  res
    .header("content-type", "application/zip")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition(filename))
  ;

  try {
    await pipeline(zip.generateNodeStream({ type: "nodebuffer", streamFiles: true }), res);
  } catch (e) {
    if ("ERR_STREAM_PREMATURE_CLOSE" === (e as { code?: unknown, }).code) {
      return;
    }

    captureError(e, { extra: { filename } });
  }
};
