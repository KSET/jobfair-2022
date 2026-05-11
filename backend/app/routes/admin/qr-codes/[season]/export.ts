import JSZip from "jszip";
import contentDisposition from "content-disposition";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
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

const svgToPdfBuffer = (svg: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 20 });
    const chunks: Uint8Array[] = [];
    doc.on("data", (c: Buffer) => chunks.push(new Uint8Array(c)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    SVGtoPDF(doc, svg, doc.page.margins.left, doc.page.margins.top, {
      width: pageWidth,
      preserveAspectRatio: "xMidYMid meet",
    });
    doc.end();
  })
;

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
            fusionParticipants: true,
          },
        },
      },
    }),
  ]);

  const seasonName = seasonRecord?.name ?? season;
  const zip = new JSZip();

  const svgRoot = zip.folder("svg")!;
  const pdfRoot = zip.folder("pdf")!;

  const svgFolders = {
    booth: svgRoot.folder("booth")!,
    talk: svgRoot.folder("talk")!,
    workshop: svgRoot.folder("workshop")!,
    fusion: svgRoot.folder("fusion")!,
  };
  const pdfFolders = {
    booth: pdfRoot.folder("booth")!,
    talk: pdfRoot.folder("talk")!,
    workshop: pdfRoot.folder("workshop")!,
    fusion: pdfRoot.folder("fusion")!,
  };

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

      const baseName = `${ company.brandName } - ${ type } - ${ seasonName }`;
      svgFolders[type].file(`${ baseName }.svg`, svg);

      const pdf = await svgToPdfBuffer(svg);
      pdfFolders[type].file(`${ baseName }.pdf`, new Uint8Array(pdf));
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
