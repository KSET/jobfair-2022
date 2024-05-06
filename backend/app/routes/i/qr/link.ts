import express, {
  type RequestHandler,
} from "express";
import QRCode, {
  type QRCodeToStringOptions,
} from "qrcode";
import {
  z,
} from "zod";
import {
  Role,
} from "../../../helpers/auth";
import {
  AuthRouter,
} from "../../../helpers/route";

const PUBLIC_URL = (process.env.PUBLIC_URL ?? "https://jobfair.fer.unizg.hr").replace(/\/*$/, "");

const router = new AuthRouter({
  role: Role.Admin,
});

router.getRaw("/", (req, res) => {
  let payload = {
    url: req.query.url,
    isRelative: false,
  };

  if (!payload.url) {
    payload = {
      url: req.query.relativeUrl,
      isRelative: true,
    };
  }

  if ("string" !== typeof payload.url) {
    return res.sendStatus(404).end();
  }

  let url = payload.url.trim();

  if (payload.isRelative) {
    if (!url.startsWith("/")) {
      url = `/${ url }`;
    }

    url = `${ PUBLIC_URL }${ url }`;
  }

  return respondWithQrCode(url, res);
});

router.postRaw("/", express.json(), (req, res) => {
  const bodyValidator = z.object({
    url: z.string().url(),
  });

  const bodyCheck = bodyValidator.safeParse(req.body);

  if (false === bodyCheck.success) {
    return res.sendStatus(404).end();
  }

  const payload = bodyCheck.data.url;

  return respondWithQrCode(payload, res);
});

type Resp = Parameters<RequestHandler<unknown>>[1];

const respondWithQrCode = async (qrCodeData: string, res: Resp) => {
  const options: QRCodeToStringOptions = {
    errorCorrectionLevel: "quartile",
    scale: 10,
    type: "svg",
    margin: 0,
    color: {
      dark: "#00003fff",
    },
  };

  try {
    const qrCode = await QRCode.toString(qrCodeData, options);

    const coords = String(qrCode).match(/viewBox="(?<coords>.*?)"/i)?.groups?.coords.split(" ").map(Number) ?? [];
    const x = coords.at(2);
    const y = coords.at(3);

    if (!x || !y) {
      throw new Error("Could not match coordinates");
    }

    const logoSize = 9;

    const pos = {
      x: (x - logoSize) / 2,
      y: (y - logoSize) / 2,
    };

    const cacheFor = 7 * 24 * 60 * 60;

    res
      .header("Cache-Control", `public, max-age=${ cacheFor }, s-maxage=${ cacheFor }, immutable`)
      .header("Content-Type", "image/svg+xml")
      .header("Connection", "close")
      .send(
        qrCode
          .replace(
            "</svg>",
            `
              <rect x="${ pos.x }" y="${ pos.y }" width="${ logoSize }" height="${ logoSize }" fill="#00003f"/>
              <path shape-rendering="geometricprecision" d="m${ pos.x + 4.114 } ${ pos.y + 2.094 }c0.0066 0.02071 0.01277 0.02687 0.03436 0.02115 0.18063-0.04846 0.3626-0.05111 0.54499-0.0075 0.02159 0.0053 0.02775-8.84e-4 0.03305-0.02203 0.0229-0.08635 0.04669-0.17227 0.07048-0.25861 0.03701-0.13305 0.07402-0.26655 0.11147-0.39961-0.08194-0.12424-0.17974-0.22954-0.30002-0.30708-0.11632-0.0749-0.23571-0.09164-0.35906-0.02115-0.14056 0.08018-0.24628 0.20178-0.33661 0.34277 0.01542 0.05155 0.03084 0.1031 0.04671 0.15464 0.05154 0.1661 0.10352 0.33131 0.15464 0.49741z" clip-rule="evenodd" fill="#ecb000" fill-rule="evenodd"/>
              <path shape-rendering="geometricprecision" d="m${ pos.x + 5.259 } ${ pos.y + 6.581 }c-0.0251-0.18989-0.05023-0.37978-0.07488-0.56967-0.01983-0.1533-0.03921-0.30708-0.05904-0.46038-0.02159-0.16875-0.04406-0.33706-0.06565-0.50578-0.02864-0.2247-0.05639-0.44984-0.08548-0.67453-0.0304-0.23527-0.06211-0.47053-0.09209-0.7058-0.0273-0.21234-0.0533-0.42516-0.08062-0.63794-0.02995-0.23175-0.0608-0.46303-0.0903-0.69478-0.0031-0.02291-0.01102-0.03261-0.03129-0.03745-0.08327-0.01939-0.16741-0.03084-0.25244-0.02776-0.08988-4.4e-4 -0.17798 0.01278-0.26522 0.03613-0.01896 0.0048-0.02688 0.01454-0.02909 0.03524-0.01409 0.14892-0.02864 0.29782-0.04317 0.44674-0.02028 0.20442-0.04097 0.40884-0.06169 0.61329-0.01938 0.19427-0.03921 0.38857-0.05859 0.58331-0.02069 0.21148-0.04052 0.42295-0.06169 0.63443-0.02466 0.24494-0.0511 0.48947-0.07533 0.73444-0.02555 0.25376-0.04933 0.50754-0.07402 0.76088-0.02555 0.25992-0.05198 0.51987-0.07842 0.77981-0.0018 0.01805-8.84e-4 0.03171 0.01057 0.04493 0.03921 0.04671 0.07756 0.09384 0.11588 0.14098 0.12115 0.14803 0.24188 0.29609 0.3626 0.44412 0.10177 0.12466 0.20266 0.2498 0.30488 0.37404 0.02995 0.03656 0.03082 0.03525 0.0608-0.0039 0.11543-0.15112 0.23086-0.30225 0.34629-0.45291 0.13392-0.17491 0.26831-0.34938 0.40312-0.52385 0.0084-0.01057 0.01674-0.02028 0.01453-0.03656-0.01367-0.09825-0.02689-0.19739-0.03965-0.29695z" clip-rule="evenodd" fill="#ecb000" fill-rule="evenodd"/>
            </svg>
          `
              .trim()
              .replace(/\s+/gi, " ")
              .replace(/> </gi, "><")
            ,
          )
        ,
      );
  } catch (e) {
    res.sendStatus(404);
  }

  res.end();
};

export default router;
