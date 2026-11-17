import JSZip from "jszip";
import {
  StatusCodes,
} from "http-status-codes";
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
  extFromMime,
  lazyObjectStream,
  mapWithConcurrency,
  objectExists,
  safeName,
  sendZip,
  uniqueZipPaths,
} from "../../../../helpers/export";

const router = new AuthRouter({
  role: Role.Admin,
});

const exportLogos = (type: "raster" | "vector") =>
  router.getRaw(`/${ type }.zip`, async (req, res) => {
    const { season } = req.params as { season: string, };

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

    if (!seasonRecord) {
      return res.sendStatus(StatusCodes.NOT_FOUND);
    }

    const logos = applications.flatMap(({ forCompany: company }) => {
      const logo = "raster" === type
        ? company.rasterLogo?.full
        : company.vectorLogo;

      return logo ? [ { brandName: company.brandName, ...logo } ] : [];
    });

    const exists = await mapWithConcurrency(logos, 8, (logo) => objectExists(logo.minioKey));

    const zip = new JSZip();
    const zipPath = uniqueZipPaths();
    const seasonName = safeName(seasonRecord.name, 60, "season");
    const missing: string[] = [];

    logos.forEach((logo, i) => {
      const baseName = `${ safeName(logo.brandName, 100, "company") } - ${ seasonName }`;

      if (!exists[i]) {
        missing.push(baseName);
        return;
      }

      zip.file(zipPath("", baseName, extFromMime(logo.mimeType)), lazyObjectStream(logo.minioKey));
    });

    if (missing.length) {
      zip.file("MISSING.txt", `Could not load ${ missing.length } logo(s):\n\n${ missing.join("\n") }\n`);
    }

    await sendZip(res, zip, `logos-${ type }.zip`);
  })
;

exportLogos("raster");
exportLogos("vector");

export default router;
