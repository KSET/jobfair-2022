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
  QrCodeService,
} from "../../../../services/qr-service";

const router = new AuthRouter({
  role: Role.Admin,
});

const buildZip = async (season: string): Promise<{ buffer: Buffer; filename: string }> => {
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
            uid: true,
            brandName: true,
          },
        },
        approval: {
          select: {
            booth: true,
            talkParticipants: true,
            workshopParticipants: true,
          },
        },
      },
    }),
  ]);

  const seasonName = seasonRecord?.name ?? season;
  const zip = new JSZip();

  const folders = {
    booth: zip.folder("booth")!,
    talk: zip.folder("talk")!,
    workshop: zip.folder("workshop")!,
  };

  for (const app of applications) {
    const company = app.forCompany;
    const approval = app.approval;

    if (!approval || !company) {
      continue;
    }

    const enabled: ("booth" | "talk" | "workshop")[] = [];

    if (approval.booth) {
      enabled.push("booth");
    }
    if (approval.talkParticipants) {
      enabled.push("talk");
    }
    if (approval.workshopParticipants) {
      enabled.push("workshop");
    }

    for (const type of enabled) {
      const svg = await QrCodeService.generateQrCode({
        relativeUrl: `/company/${ company.uid }/rate?season=${ season }&type=${ type }`,
        "color.dark": "#000",
        "color.logo": "#fff",
        text: company.brandName,
      });
      folders[type].file(`${ company.brandName } - ${ type } - ${ seasonName }.svg`, svg);
    }
  }

  return {
    buffer: await zip.generateAsync({ type: "nodebuffer" }),
    filename: `qr-codes - ${ seasonName }.zip`,
  };
};

router.getRaw("/qr-codes.zip", async (req, res) => {
  const { season } = req.params as { season: string };
  const { buffer, filename } = await buildZip(season);

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
