export const fixedEncodeURIComponent =
  (str: string) =>
    encodeURIComponent(str)
      .replace(
        /[!'()*]/g,
        (c) => `%${ c.charCodeAt(0).toString(16) }`,
      )
;

export const encodeRedirectParam =
  ({ name, params }: { name: string, params: unknown }) =>
    Buffer
      .from(
        JSON.stringify({ name, params }),
        "binary",
      )
      .toString("base64")
;

export const decodeRedirectParam =
  (redirectParam: string, fallback: string | null = null): string | null => {
    try {
      return (
        JSON
          .parse(
            Buffer
              .from(
                redirectParam,
                "base64",
              )
              .toString("binary")
            ,
          )
      );
    } catch {
      return fallback;
    }
  }
;


export const getUrlWithQueryParam = (param: string, value: string): string => {
  const params = new URLSearchParams(location.search);

  if (value) {
    params.set(param, value);
  } else {
    params.delete(param);
  }

  let queryString = params.toString();
  if (queryString) {
    queryString = `?${ queryString }`;
  }

  return `${ location.pathname }${ queryString }`;
};
