import QRCode, {
  type QRCodeToStringOptions,
} from "qrcode";
import {
  z,
} from "zod";

const QR_INFO_VALIDATOR_URL = z
  .object({
    url: z.string().url(),
  })
  .or(
    z.object({
      relativeUrl: z.string(),
    }),
  );

const QR_INFO_VALIDATOR = z
  .object({
    text: z.string().optional(),
    "color.dark": z.string().optional(),
    "color.light": z.string().optional(),
    "color.logo": z.string().optional(),
  })
  .and(QR_INFO_VALIDATOR_URL);

export type QrInfo = z.infer<typeof QR_INFO_VALIDATOR>;

export class QrCodeService {
  public static validateQrInfo(data: unknown) {
    return QR_INFO_VALIDATOR.safeParse(data);
  }

  public static async generateQrCode({
    text: qrCodeText,
    "color.dark": qrCodeColorDark,
    "color.light": qrCodeColorLight,
    "color.logo": qrCodeColorLogo,
    ...urlOrRelative
  }: QrInfo) {
    const qrCodeData = parseUrlOrRelative(urlOrRelative);
    const qrColors = {
      dark: "#00003f",
      light: "#ffffff",
      logo: "#ecb000",
    };

    if (qrCodeColorDark) {
      qrColors.dark = qrCodeColorDark;
    }
    if (qrCodeColorLight) {
      qrColors.light = qrCodeColorLight;
    }
    if (qrCodeColorLogo) {
      qrColors.logo = qrCodeColorLogo;
    }

    const options = {
      errorCorrectionLevel: "quartile",
      scale: 10,
      type: "svg",
      margin: 0,
      color: qrColors,
    } satisfies QRCodeToStringOptions;

    const qrCode = await QRCode.toString(qrCodeData, options);

    const coords =
      String(qrCode)
        .match(/viewBox="(?<coords>.*?)"/i)
        ?.groups?.coords.split(" ")
        .map(Number) ?? [];
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

    const lines = breakStringIntoLines(qrCodeText ?? "", 15);
    const yOffset = 6 * lines.length;

    let textContent = lines
      .map((line, i) => {
        const dy = 0 === i ? "" : 'dy="1em"';

        return `<tspan x="0" ${ dy }>${ escapeHtml(line) }</tspan>`;
      })
      .join("")
      .trim();
    textContent = textContent
      ? `
        <defs>
            <style type="text/css">
            @import url("https://fonts.googleapis.com/css2?family=Roboto&amp;display=swap");
            </style>
        </defs>
        <text text-anchor="middle" xmlns="http://www.w3.org/2000/svg" y="58" x="100%" style="font-size: 6px; white-space: wrap; font-family: Roboto; transform: translateX(50%);">
            ${ textContent }
        </text>
        `
      : "";

    return qrCode
      .replace(
        "</svg>",
        `
            <rect x="${ pos.x }" y="${ pos.y }" width="${ logoSize }" height="${ logoSize }" fill="${ qrColors.dark }"/>
            <path shape-rendering="geometricprecision" d="m${ pos.x + 4.114 } ${ pos.y + 2.094 }c0.0066 0.02071 0.01277 0.02687 0.03436 0.02115 0.18063-0.04846 0.3626-0.05111 0.54499-0.0075 0.02159 0.0053 0.02775-8.84e-4 0.03305-0.02203 0.0229-0.08635 0.04669-0.17227 0.07048-0.25861 0.03701-0.13305 0.07402-0.26655 0.11147-0.39961-0.08194-0.12424-0.17974-0.22954-0.30002-0.30708-0.11632-0.0749-0.23571-0.09164-0.35906-0.02115-0.14056 0.08018-0.24628 0.20178-0.33661 0.34277 0.01542 0.05155 0.03084 0.1031 0.04671 0.15464 0.05154 0.1661 0.10352 0.33131 0.15464 0.49741z" clip-rule="evenodd" fill="${ qrColors.logo }" fill-rule="evenodd"/>
            <path shape-rendering="geometricprecision" d="m${ pos.x + 5.259 } ${ pos.y + 6.581 }c-0.0251-0.18989-0.05023-0.37978-0.07488-0.56967-0.01983-0.1533-0.03921-0.30708-0.05904-0.46038-0.02159-0.16875-0.04406-0.33706-0.06565-0.50578-0.02864-0.2247-0.05639-0.44984-0.08548-0.67453-0.0304-0.23527-0.06211-0.47053-0.09209-0.7058-0.0273-0.21234-0.0533-0.42516-0.08062-0.63794-0.02995-0.23175-0.0608-0.46303-0.0903-0.69478-0.0031-0.02291-0.01102-0.03261-0.03129-0.03745-0.08327-0.01939-0.16741-0.03084-0.25244-0.02776-0.08988-4.4e-4 -0.17798 0.01278-0.26522 0.03613-0.01896 0.0048-0.02688 0.01454-0.02909 0.03524-0.01409 0.14892-0.02864 0.29782-0.04317 0.44674-0.02028 0.20442-0.04097 0.40884-0.06169 0.61329-0.01938 0.19427-0.03921 0.38857-0.05859 0.58331-0.02069 0.21148-0.04052 0.42295-0.06169 0.63443-0.02466 0.24494-0.0511 0.48947-0.07533 0.73444-0.02555 0.25376-0.04933 0.50754-0.07402 0.76088-0.02555 0.25992-0.05198 0.51987-0.07842 0.77981-0.0018 0.01805-8.84e-4 0.03171 0.01057 0.04493 0.03921 0.04671 0.07756 0.09384 0.11588 0.14098 0.12115 0.14803 0.24188 0.29609 0.3626 0.44412 0.10177 0.12466 0.20266 0.2498 0.30488 0.37404 0.02995 0.03656 0.03082 0.03525 0.0608-0.0039 0.11543-0.15112 0.23086-0.30225 0.34629-0.45291 0.13392-0.17491 0.26831-0.34938 0.40312-0.52385 0.0084-0.01057 0.01674-0.02028 0.01453-0.03656-0.01367-0.09825-0.02689-0.19739-0.03965-0.29695z" clip-rule="evenodd" fill="${ qrColors.logo }" fill-rule="evenodd"/>
            ${ textContent }
        </svg>
        `,
      )
      .replace(
        /viewBox="(?<coords>.*?)"/i,
        `viewBox="0 0 ${ x } ${ y + 1 + yOffset }"`,
      );
  }
}

const PUBLIC_URL = (
  process.env.PUBLIC_URL ?? "https://jobfair.fer.unizg.hr"
).replace(/\/*$/, "");

const escapeHtml = (unsafe: string) =>
  unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const parseUrlOrRelative = (
  urlOrRelative: z.infer<typeof QR_INFO_VALIDATOR_URL>,
) => {
  if ("url" in urlOrRelative) {
    return urlOrRelative.url;
  }

  return `${ PUBLIC_URL }/${ urlOrRelative.relativeUrl.replace(/^\/*/, "") }`;
};

const breakStringIntoLines = (str: string, maxLineLength: number) => {
  const lines = [];

  while (str.length) {
    const chunk = str.slice(0, maxLineLength + 1);
    const newlineIndex = chunk.indexOf("\n");

    if (-1 !== newlineIndex) {
      lines.push(chunk.slice(0, newlineIndex));
      str = str.slice(newlineIndex + 1).trimStart();
      continue;
    }

    if (chunk.length < maxLineLength) {
      lines.push(str);
      break;
    }

    // Find last space
    let lastIndex = getLastMatch(chunk, /[\s]/g)?.index;
    // Find last lower -> UPPER transition
    if (!lastIndex) {
      lastIndex = getLastMatch(chunk, /[a-z][A-Z]/g)?.index;
    }
    // Find last punctuation or non-word character
    if (!lastIndex) {
      lastIndex = getLastMatch(chunk, /[\p{P}\W]/g)?.index;
    }
    lastIndex ??= 0;

    const cutIndex = 0 < lastIndex ? lastIndex + 1 : maxLineLength;
    const newChunk = chunk.slice(0, cutIndex).trim();
    lines.push(newChunk);
    str = str.slice(cutIndex).trimStart();
  }

  return lines;
};

const getLastMatch = (str: string, regex: RegExp) => {
  let match;
  let prevMatch;
  while (null !== (match = regex.exec(str))) {
    prevMatch = match;
  }
  return prevMatch;
};
