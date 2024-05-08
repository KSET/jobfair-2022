import express, {
  type RequestHandler,
} from "express";
import {
  Role,
} from "../../../helpers/auth";
import {
  AuthRouter,
} from "../../../helpers/route";
import {
  QrCodeService,
  type QrInfo,
} from "../../../services/qr-service";

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", (req, res) => {
  const queryCheck = QrCodeService.validateQrInfo(req.query);

  if (false === queryCheck.success) {
    return res.sendStatus(404).end();
  }

  return respondWithQrCode(queryCheck.data, res);
});

router.postRaw("/", express.json(), (req, res) => {
  const bodyCheck = QrCodeService.validateQrInfo(req.body);

  if (false === bodyCheck.success) {
    return res.sendStatus(404).end();
  }

  return respondWithQrCode(bodyCheck.data, res);
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
    res.sendStatus(404);
  }

  res.end();
};

export default router;
