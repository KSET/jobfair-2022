type CsvRow = readonly unknown[];

const toCellString = (value: unknown): string =>
  null === value || undefined === value
    ? ""
    : String(value)
;

const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const escapeCsv = (value: unknown): string => {
  const str = toCellString(value);

  return /[",\r\n]/.test(str)
    ? `"${ str.replace(/"/g, '""') }"`
    : str
  ;
};

export const downloadCsv = (
  headers: readonly string[],
  rows: readonly CsvRow[],
  filename: string,
): void => {
  const csv =
    [ headers, ...rows ]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n")
  ;

  triggerDownload(
    new Blob([ `\uFEFF${ csv }` ], { type: "text/csv;charset=utf-8;" }),
    filename,
  );
};

const toIllustratorVariableNames = (headers: readonly string[]): string[] => {
  const used = new Set<string>();

  return headers.map((header) => {
    const sanitized =
      header
        .replace(/[^A-Za-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "")
    ;
    const base =
      !sanitized || /^\d/.test(sanitized)
        ? `_${ sanitized }`
        : sanitized
    ;

    let name = base;
    for (let i = 2; used.has(name); i++) {
      name = `${ base }_${ i }`;
    }
    used.add(name);

    return name;
  });
};

const quoteIllustratorValue = (value: unknown): string => {
  const str = toCellString(value).replace(/\s*[\r\n]+\s*/g, " ");

  return `"${ str.replace(/"/g, '""') }"`;
};

const encodeUtf16Le = (str: string): ArrayBuffer => {
  const buffer = new ArrayBuffer((str.length + 1) * 2);
  const view = new DataView(buffer);
  view.setUint16(0, 0xFEFF, true);
  for (let i = 0; i < str.length; i++) {
    view.setUint16((i + 1) * 2, str.charCodeAt(i), true);
  }

  return buffer;
};

export const downloadIllustratorCsv = (
  headers: readonly string[],
  rows: readonly CsvRow[],
  filename: string,
): void => {
  const csv =
    [
      toIllustratorVariableNames(headers).map((h) => `"${ h }"`).join(","),
      ...rows.map((row) => row.map(quoteIllustratorValue).join(",")),
    ]
      .join("\r\n")
  ;

  triggerDownload(
    new Blob([ encodeUtf16Le(csv) ], { type: "text/csv;charset=utf-16le;" }),
    filename.replace(/(\.csv)?$/i, "-illustrator.csv"),
  );
};
