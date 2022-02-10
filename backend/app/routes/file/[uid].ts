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
  pipeFileInto,
} from "../../helpers/minio";

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

  await pipeFileInto(file.minioKey, res);

  return res.end();
});

export default router;
