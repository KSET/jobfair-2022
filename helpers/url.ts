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

export const urlJoin = (...args: string[] | [ string[] ]) => {
  const urlParts = ("string" === typeof args[0] ? args : args[0]) as string[];
  const resultArray = [];
  if (0 === urlParts.length) {
    return "";
  }

  if ("string" !== typeof urlParts[0]) {
    throw new TypeError(`Url must be a string. Received ${ urlParts[0] as string }`);
  }

  // If the first part is a plain protocol, we combine it with the next part.
  if (urlParts[0].match(/^[^/:]+:\/*$/) && 1 < urlParts.length) {
    urlParts[0] = urlParts.shift()! + urlParts[0];
  }

  // There must be two or three slashes in the file protocol, two slashes in anything else.
  if (urlParts[0].match(/^file:\/\/\//)) {
    urlParts[0] = urlParts[0].replace(/^([^/:]+):\/*/, "$1:///");
  } else {
    urlParts[0] = urlParts[0].replace(/^([^/:]+):\/*/, "$1://");
  }

  for (let i = 0; i < urlParts.length; i++) {
    let component = urlParts[i];

    if ("string" !== typeof component) {
      throw new TypeError(`Url must be a string. Received ${ component as string }`);
    }

    if ("" === component) {
      continue;
    }

    if (0 < i) {
      // Removing the starting slashes for each component but the first.
      component = component.replace(/^\/+/, "");
    }
    if (i < urlParts.length - 1) {
      // Removing the ending slashes for each component but the last.
      component = component.replace(/\/+$/, "");
    } else {
      // For the last component we will combine multiple slashes to a single one.
      component = component.replace(/\/+$/, "/");
    }

    resultArray.push(component);
  }

  let str = resultArray.join("/");
  // Each input component is now separated by a single slash except the possible first plain protocol part.

  // remove trailing slash before parameters or hash
  str = str.replace(/\/(\?|&|#[^!])/g, "$1");

  // replace ? in parameters with &
  const parts = str.split("?");
  str = parts.shift()! + (0 < parts.length ? "?" : "") + parts.join("&");

  return str;
};
