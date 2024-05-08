import {
  StatusCodes,
} from "http-status-codes";
import {
  type RequestHandler,
} from "express";
import {
  AuthRouter,
} from "../../../../helpers/route";
import {
  QrCodeService, type QrInfo,
} from "../../../../services/qr-service";
import {
  prisma,
} from "../../../../providers/prisma";
import {
  Role,
} from "../../../../helpers/auth";

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", async (req, res) => {
  const user = req.user!;
  const company = user.companies.at(0);

  if (!company) {
    return res.sendStatus(StatusCodes.NOT_FOUND);
  }

  const currentSeason = await prisma.season.findFirst({
    where: {
      startsAt: {
        lte: new Date(),
      },
      endsAt: {
        gte: new Date(),
      },
    },
    select: {
      uid: true,
    },
  });

  if (!currentSeason) {
    return res.sendStatus(StatusCodes.GONE);
  }

  return respondWithQrCode({
    relativeUrl: `/company/${ company.uid }/rate?season=${ currentSeason.uid }&type=booth`,
  }, res);
});

type Resp = Parameters<RequestHandler<unknown>>[1];
const respondWithQrCode = async (
  args: QrInfo,
  res: Resp,
) => {
  try {
    const qrCode = await QrCodeService.generateQrCode(args);

    const cacheFor = 7 * 24 * 60 * 60;
    res
      .header("Cache-Control", `public, max-age=${ cacheFor }, s-maxage=${ cacheFor }, immutable`)
      .header("Content-Type", "image/svg+xml")
      .header("Connection", "close")
      .send(qrCode);
  } catch (e) {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }

  res.end();
};

export default router;
