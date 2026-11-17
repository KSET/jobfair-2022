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
import {
  presenterOrderBy,
} from "../../../../helpers/presenter";

const router = new AuthRouter({
  role: Role.Admin,
});

const variationSelect = {
  select: {
    minioKey: true,
    mimeType: true,
  },
} as const;

const presentersSelect = {
  orderBy: presenterOrderBy,
  select: {
    firstName: true,
    lastName: true,
    photo: {
      select: {
        original: variationSelect,
        full: variationSelect,
      },
    },
  },
} as const;

const fetchApplications = (season: string) =>
  prisma.companyApplication.findMany({
    where: {
      forSeason: { uid: season },
    },
    orderBy: {
      forCompany: {
        brandName: "asc",
      },
    },
    select: {
      forCompany: {
        select: {
          brandName: true,
        },
      },
      approval: {
        select: {
          talkParticipants: true,
          workshopParticipants: true,
          fusionParticipants: true,
          panel: true,
        },
      },
      talk: {
        select: {
          titleHr: true,
          presenters: presentersSelect,
        },
      },
      workshop: {
        select: {
          titleHr: true,
          presenters: presentersSelect,
        },
      },
      fusion: {
        select: {
          titleHr: true,
          presenters: presentersSelect,
        },
      },
      panel: {
        select: {
          name: true,
        },
      },
      panelParticipants: presentersSelect,
    },
  })
;

type Presenter = Awaited<ReturnType<typeof fetchApplications>>[number]["panelParticipants"][number];

type PhotoJob = {
  folder: string,
  baseName: string,
  minioKey: string,
  mimeType: string,
};

router.getRaw("/photos.zip", async (req, res) => {
  const { season } = req.params as { season: string, };

  const [ seasonRecord, applications ] = await Promise.all([
    prisma.season.findUnique({
      where: { uid: season },
      select: { name: true },
    }),
    fetchApplications(season),
  ]);

  if (!seasonRecord) {
    return res.sendStatus(StatusCodes.NOT_FOUND);
  }

  const jobs: PhotoJob[] = [];
  const noPhoto: string[] = [];

  for (const app of applications) {
    const { approval } = app;

    if (!approval) {
      continue;
    }

    const categories: [ string, string, Presenter[] ][] = [];

    if (0 < approval.talkParticipants && app.talk) {
      categories.push([ "talks", app.talk.titleHr, app.talk.presenters ]);
    }
    if (0 < approval.workshopParticipants && app.workshop) {
      categories.push([ "workshops", app.workshop.titleHr, app.workshop.presenters ]);
    }
    if (0 < approval.fusionParticipants && app.fusion) {
      categories.push([ "fusion", app.fusion.titleHr, app.fusion.presenters ]);
    }
    if (approval.panel) {
      categories.push([ "panel", app.panel?.name ?? "Panel", app.panelParticipants ]);
    }

    for (const [ category, title, presenters ] of categories) {
      for (const presenter of presenters) {
        const baseName = [
          safeName(app.forCompany.brandName, 60, "company"),
          safeName(title, 80, category),
          safeName(`${ presenter.firstName } ${ presenter.lastName }`, 60, "presenter"),
        ].join("-");

        if (!presenter.photo) {
          noPhoto.push(`${ category }/${ baseName }`);
          continue;
        }

        for (const [ variant, variation ] of [
          [ "full", presenter.photo.original ],
          [ "cropped", presenter.photo.full ],
        ] as const) {
          jobs.push({
            folder: `${ category }/${ variant }`,
            baseName: `${ baseName }-${ variant }`,
            minioKey: variation.minioKey,
            mimeType: variation.mimeType,
          });
        }
      }
    }
  }

  const exists = await mapWithConcurrency(jobs, 8, (job) => objectExists(job.minioKey));

  const zip = new JSZip();
  const zipPath = uniqueZipPaths();
  const unloadable: string[] = [];

  jobs.forEach((job, i) => {
    if (!exists[i]) {
      unloadable.push(`${ job.folder }/${ job.baseName }`);
      return;
    }

    zip.file(zipPath(job.folder, job.baseName, extFromMime(job.mimeType)), lazyObjectStream(job.minioKey));
  });

  const report = ([
    [ "No photo uploaded", noPhoto ],
    [ "Photo file could not be loaded", unloadable ],
  ] as const)
    .filter(([ , items ]) => items.length)
    .map(([ heading, items ]) => `${ heading } (${ items.length }):\n\n${ items.join("\n") }\n`)
  ;

  if (report.length) {
    zip.file("MISSING.txt", report.join("\n"));
  }

  await sendZip(res, zip, `presenter-photos-${ safeName(seasonRecord.name, 100, "season") }.zip`);
});

export default router;
