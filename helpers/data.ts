import get from "lodash/fp/get";
import isFunction from "lodash/fp/isFunction";

export const ensureArray =
  <T>(val: unknown | T[]): T[] =>
    Array.isArray(val)
      ? val
      : []
;

export const limitLength =
  (length: number) =>
    <T>(array: T[]): T[] =>
      array.slice(0, length)
;

export const dotGet =
  <T>(
    object: Record<string, unknown>,
    key: string,
    defaultValue: T | (() => T),
  ): T => {
    const v = get(key, object) as T;

    if (v !== undefined) {
      return v;
    } else if (!isFunction(defaultValue)) {
      return defaultValue;
    } else {
      return defaultValue();
    }
  }
;
