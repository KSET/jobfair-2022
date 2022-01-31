import {
  StatusCodes,
} from "http-status-codes";
import contentDisposition from "content-disposition";
import {
  Router,
} from "../../helpers/route";
import {
  prisma,
} from "../../providers/prisma";
import {
  BUCKET_NAME,
  minio,
} from "../../providers/minio";

const router = new Router();

router.getRaw("/", async (req, res) => {
  const { uid } = req.params as Record<string, string>;

  const file = await prisma.file.findUnique({
    where: {
      uid,
    },
    select: {
      minioKey: true,
      mimeType: true,
      etag: true,
      name: true,
    },
  });

  if (!file) {
    return res.sendStatus(StatusCodes.NOT_FOUND);
  }

  res
    .header("content-type", file.mimeType)
    .header("etag", file.etag)
    .header("content-disposition", contentDisposition(file.name))
  ;

  const minioFile = await minio.getObject(BUCKET_NAME, file.minioKey);

  await new Promise((resolve) => {
    minioFile.pipe(res);

    minioFile.on("end", () => {
      resolve(true);
    });

    minioFile.on("error", () => {
      resolve(true);
    });
  });

  return res.end();
});

export default router;
