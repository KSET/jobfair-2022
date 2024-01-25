import {
  StatusCodes,
} from "http-status-codes";
import {
  Router,
} from "../../helpers/route";
import {
  prisma,
} from "../../providers/prisma";
import {
  RouteHandler,
} from "../../helpers/request";
import {
  pipeFileInto,
} from "../../helpers/minio";

const router = new Router();

const serveImage =
  (size: "full" | "thumb" | "original", uid: string): RouteHandler<unknown> =>
    async (req, res) => {
      const fileObj = await prisma.image.findUnique({
        where: {
          uid,
        },
        select: {
          name: true,
          [size]: {
            select: {
              minioKey: true,
              mimeType: true,
              etag: true,
            },
          },
        },
      });

      if (!fileObj) {
        return res.sendStatus(StatusCodes.NOT_FOUND);
      }


      const file = {
        // @ts-ignore
        name: fileObj.name as string,
        // @ts-ignore
        mimeType: fileObj[size].mimeType as string,
        // @ts-ignore
        minioKey: fileObj[size].minioKey as string,
        // @ts-ignore
        etag: fileObj[size].etag as string,
      };


      const providedEtag = req.header("if-none-match");

      if (providedEtag && providedEtag === file.etag) {
        return res.sendStatus(StatusCodes.NOT_MODIFIED);
      }

      res
        .header("content-type", file.mimeType)
        .header("etag", file.etag)
        .header("cache-control", "max-age=31536000, public, immutable")
      ;

      await pipeFileInto(file.minioKey, res);

      return res.end();
    }
;

router.getRaw("/full", (req, res) => {
  const { uid } = req.params as Record<string, string>;

  return serveImage("full", uid)(req, res, () => void 0);
});

router.getRaw("/thumb", (req, res) => {
  const { uid } = req.params as Record<string, string>;

  return serveImage("thumb", uid)(req, res, () => void 0);
});

router.getRaw("/original", (req, res) => {
  const { uid } = req.params as Record<string, string>;

  return serveImage("original", uid)(req, res, () => void 0);
});

export default router;
