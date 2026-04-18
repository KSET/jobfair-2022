import JSZip from "jszip";
import contentDisposition from "content-disposition";
import {
  AuthRouter,
} from "../../../../helpers/route";
import {
  Role,
} from "../../../../helpers/auth";
import {
  prisma,
} from "../../../../providers/prisma";
import {
  BUCKET_NAME,
  minio,
} from "../../../../providers/minio";

const router = new AuthRouter({
  role: Role.Admin,
});

const extFromMime = (mime: string): string => {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
    "application/postscript": "eps",
  };
  return map[mime] ?? mime.split("/").pop()?.replace("+xml", "") ?? "bin";
};

const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer | null> =>
  new Promise((resolve) => {
    const parts: Uint8Array[] = [];
    stream.on("data", (data: Uint8Array) => {
      parts.push(data);
    });
    stream.on("end", () => {
      resolve(Buffer.concat(parts));
    });
    stream.on("error", () => {
      resolve(null);
    });
  })
;

const buildZip = async (season: string, type: "raster" | "vector"): Promise<{ buffer: Buffer; filename: string }> => {
  const [ seasonRecord, applications ] = await Promise.all([
    prisma.season.findUnique({
      where: { uid: season },
      select: { name: true },
    }),
    prisma.companyApplication.findMany({
      where: {
        forSeason: { uid: season },
      },
      select: {
        forCompany: {
          select: {
            brandName: true,
            rasterLogo: {
              select: {
                full: {
                  select: {
                    minioKey: true,
                    mimeType: true,
                  },
                },
              },
            },
            vectorLogo: {
              select: {
                minioKey: true,
                mimeType: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const seasonName = seasonRecord?.name ?? season;
  const zip = new JSZip();

  for (const app of applications) {
    const company = app.forCompany;
    const logo = "raster" === type
      ? company.rasterLogo?.full
      : company.vectorLogo;

    if (!logo?.minioKey) {
      continue;
    }

    const stream = await minio.getObject(BUCKET_NAME, logo.minioKey);
    const buffer = await streamToBuffer(stream);

    if (!buffer) {
      continue;
    }

    const ext = extFromMime(logo.mimeType);
    zip.file(`${ company.brandName } - ${ seasonName }.${ ext }`, new Uint8Array(buffer).buffer as ArrayBuffer);
  }

  return {
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
    filename: "raster" === type ? "logos-raster.zip" : "logos-vector.zip",
  };
};

router.getRaw("/raster.zip", async (req, res) => {
  const { season } = req.params as { season: string };
  const { buffer, filename } = await buildZip(season, "raster");

  res
    .header("content-type", "application/zip")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition(filename))
  ;

  return res.end(buffer);
});

router.getRaw("/vector.zip", async (req, res) => {
  const { season } = req.params as { season: string };
  const { buffer, filename } = await buildZip(season, "vector");

  res
    .header("content-type", "application/zip")
    .header("cache-control", "no-cache")
    .header("pragma", "no-store, private, no-cache, max-age=0, must-revalidate")
    .header("expires", "-1")
    .header("content-disposition", contentDisposition(filename))
  ;

  return res.end(buffer);
});

export default router;
