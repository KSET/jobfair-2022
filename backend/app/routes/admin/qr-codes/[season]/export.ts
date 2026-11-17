import JSZip from "jszip";
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
import {
  safeName,
  sendZip,
  uniqueZipPaths,
} from "../../../../helpers/export";

const router = new AuthRouter({
  role: Role.Admin,
});

const buildZip = async (season: string): Promise<{ zip: JSZip, filename: string, }> => {
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
            fusionParticipants: true,
          },
        },
      },
    }),
  ]);

  const seasonName = safeName(seasonRecord?.name ?? season, 60, "season");
  const zip = new JSZip();
  const zipPath = uniqueZipPaths();

  for (const folder of [ "booth", "talk", "workshop", "fusion" ]) {
    zip.folder(folder);
  }

  for (const app of applications) {
    const company = app.forCompany;
    const approval = app.approval;

    if (!approval || !company) {
      continue;
    }

    const enabled: ("booth" | "talk" | "workshop" | "fusion")[] = [];

    if (approval.booth) {
      enabled.push("booth");
    }
    if (approval.talkParticipants) {
      enabled.push("talk");
    }
    if (approval.workshopParticipants) {
      enabled.push("workshop");
    }
    if (approval.fusionParticipants) {
      enabled.push("fusion");
    }

    for (const type of enabled) {
      const svg = await QrCodeService.generateQrCode({
        relativeUrl: `/company/${ company.uid }/rate?season=${ season }&type=${ type }`,
        "color.dark": "#000",
        "color.logo": "#fff",
        text: company.brandName,
      });
      zip.file(zipPath(type, `${ safeName(company.brandName, 100, "company") } - ${ type } - ${ seasonName }`, "svg"), svg);
    }
  }

  return {
    zip,
    filename: `qr-codes - ${ seasonName }.zip`,
  };
};

router.getRaw("/qr-codes.zip", async (req, res) => {
  const { season } = req.params as { season: string };
  const { zip, filename } = await buildZip(season);

  await sendZip(res, zip, filename);
});

export default router;
