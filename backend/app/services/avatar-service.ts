const SIZE = 36;

const generateData = (name: string, colors: string[]) => {
  const hashCode = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const character = name.charCodeAt(i);
      // eslint-disable-next-line no-bitwise
      hash = ((hash << 5) - hash) + character;
      // eslint-disable-next-line no-bitwise
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const getDigit = (number: number, nth: number) => {
    return Math.floor((number / Math.pow(10, nth)) % 10);
  };

  const getBoolean = (number: number, nth: number) => {
    return 0 === getDigit(number, nth) % 2;
  };

  const getUnit = (number: number, range: number, index: number = 0) => {
    const value = number % range;

    if (index && 0 === (getDigit(number, index) % 2)) {
      return -value;
    } else {
      return value;
    }
  };

  const getRandomColor = (number: number, colors: string[], range: number) => {
    return colors[number % range];
  };

  const getContrast = (hexColor: string) => {
    // If a leading # is provided, remove it
    if ("#" === hexColor[0]) {
      hexColor = hexColor.slice(1);
    }

    // Convert to RGB value
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Get YIQ ratio
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Check contrast
    return (128 <= yiq) ? "#000000" : "#ffffff";
  };

  const numFromName = hashCode(name);
  const range = colors?.length;
  const wrapperColor = getRandomColor(numFromName, colors, range);
  const preTranslateX = getUnit(numFromName, 10, 1);
  const wrapperTranslateX = 5 > preTranslateX ? preTranslateX + SIZE / 9 : preTranslateX;
  const preTranslateY = getUnit(numFromName, 10, 2);
  const wrapperTranslateY = 5 > preTranslateY ? preTranslateY + SIZE / 9 : preTranslateY;

  return {
    wrapperColor,
    faceColor: getContrast(wrapperColor),
    backgroundColor: getRandomColor(numFromName + 13, colors, range),
    wrapperTranslateX,
    wrapperTranslateY,
    wrapperRotate: getUnit(numFromName, 360),
    wrapperScale: 1 + getUnit(numFromName, SIZE / 12) / 10,
    isMouthOpen: getBoolean(numFromName, 2),
    isCircle: getBoolean(numFromName, 1),
    eyeSpread: getUnit(numFromName, 5),
    mouthSpread: getUnit(numFromName, 3),
    faceRotate: getUnit(numFromName, 10, 3),
    faceTranslateX: (
      wrapperTranslateX > SIZE / 6
        ? wrapperTranslateX / 2
        : getUnit(numFromName, 8, 1)
    ),
    faceTranslateY: (
      wrapperTranslateY > SIZE / 6
        ? wrapperTranslateY / 2
        : getUnit(numFromName, 7, 2)
    ),
  };
};

export class AvatarService {
  static placeholder(
    seed: string,
    opts = {
      colors: [
        "#fe7f2d",
        "#ecb000",
        "#57cc99",
        "#54c6eb",
        "#33658a",
        "#00003f",
      ],
      size: 128,
      square: false,
    },
  ) {
    const data = generateData(seed, opts.colors);
    const props = {
      size: opts.size,
      square: opts.square,
    } as const;

    return `
<svg
  viewBox="0 0 ${ SIZE } ${ SIZE }"
  fill="none"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  width="${ props.size }"
  height="${ props.size }"
>
  <mask id="mask__beam" maskUnits="userSpaceOnUse" x="0" y="0" width="${ SIZE }" height="${ SIZE }">
    <rect width="${ SIZE }" height="${ SIZE }" ${ props.square ? "" : `rx="${ SIZE * 2 }"` } fill="#FFFFFF" />
  </mask>
  <g mask="url(#mask__beam)">
    <rect width="${ SIZE }" height="${ SIZE }" fill="${ data.backgroundColor }" />
    <rect
      x="0"
      y="0"
      width="${ SIZE }"
      height="${ SIZE }"
      transform="translate(${ data.wrapperTranslateX } ${ data.wrapperTranslateY }) rotate(${ data.wrapperRotate } ${ SIZE / 2 } ${ SIZE / 2 }) scale(${ data.wrapperScale })"
      fill="${ data.wrapperColor }"
      rx="${ data.isCircle ? SIZE : SIZE / 6 }"
    />
    <g
      transform="translate(${ data.faceTranslateX } ${ data.faceTranslateY }) rotate(${ data.faceRotate } ${ SIZE / 2 } ${ SIZE / 2 })"
    >
      ${
  data.isMouthOpen
    ? `<path
     d="M15 ${ 19 + data.mouthSpread }c2 1 4 1 6 0"
     stroke="${ data.faceColor }"
     fill="none"
     strokeLinecap="round"
  />`
    : `<path
     d="M13,${ 19 + data.mouthSpread } a1,0.75 0 0,0 10,0"
     fill="${ data.faceColor }"
   />`
}
      <rect
        x="${ 14 - data.eyeSpread }"
        y="14"
        width="1.5"
        height="2"
        rx="1"
        stroke="none"
        fill="${ data.faceColor }"
      />
      <rect
        x="${ 20 + data.eyeSpread }"
        y="14"
        width="1.5"
        height="2"
        rx="1"
        stroke="none"
        fill="${ data.faceColor }"
      />
    </g>
  </g>
</svg>
`;
  }
}
