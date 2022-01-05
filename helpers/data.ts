import {
  type,
  path,
} from "rambda";

export const ensureArray =
  <T>(val: T[]): T[] =>
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
    object: Record<string, unknown> | undefined,
    key: string,
    defaultValue: T | (() => T),
  ): T => {
    const v = path<typeof object, T>(key, object);

    if (v !== undefined) {
      return v;
    } else if ("Function" !== type(defaultValue)) {
      return defaultValue as T;
    } else {
      return (defaultValue as (() => T))();
    }
  }
;
