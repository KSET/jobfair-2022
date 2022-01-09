import {
  base64Decode,
  base64Encode,
} from "~/helpers/string";

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
    base64Encode(JSON.stringify({ name, params }))
;

export const decodeRedirectParam =
  (redirectParam: string, fallback: string | null = null): string | null => {
    try {
      return JSON.parse(base64Decode(redirectParam)) as string;
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
