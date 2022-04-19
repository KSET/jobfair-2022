import type {
  RouteLocationRaw,
} from "vue-router";
import {
  base64Decode,
  base64Encode,
} from "~/helpers/string";

type RedirectParams = RouteLocationRaw;

export const fixedEncodeURIComponent =
  (str: string) =>
    encodeURIComponent(str)
      .replace(
        /[!'()*]/g,
        (c) => `%${ c.charCodeAt(0).toString(16) }`,
      )
;

export const encodeRedirectParam =
  (params: RedirectParams) =>
    base64Encode(JSON.stringify(params))
;

export const decodeRedirectParam =
  (redirectParam: string, fallback: RedirectParams | null = null): RedirectParams | null => {
    try {
      return JSON.parse(base64Decode(redirectParam)) as RedirectParams;
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
