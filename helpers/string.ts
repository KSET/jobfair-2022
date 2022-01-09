export const capitalize =
  (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1)
;

export const base64Encode =
  (string: string) =>
    ("undefined" !== typeof Buffer)
      ? Buffer.from(string, "binary").toString("base64")
      : btoa(string)
;

export const base64Decode =
  (string: string) =>
    ("undefined" !== typeof Buffer)
      ? Buffer.from(string, "base64").toString("binary")
      : atob(string)
;
