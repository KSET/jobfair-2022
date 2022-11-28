import {
  get,
} from "lodash";
import {
  isFunction,
} from "lodash-es";
import {
  Path,
  PathValue,
  RecursiveNonPartial,
} from "~/helpers/type";

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

export const dotGet = <TObject,
  TProp extends Path<RecursiveNonPartial<TObject>> = Path<RecursiveNonPartial<TObject>>,
  TReturns extends PathValue<RecursiveNonPartial<TObject>, TProp> = PathValue<RecursiveNonPartial<TObject>, TProp>,
  TFallback extends (TReturns | (() => TReturns) | undefined) = undefined,
  >
(
  obj: TObject | undefined,
  prop: TProp,
  fallback?: TFallback,
) => {
  type FallbackReturn =
    TFallback extends undefined
      ? undefined
      : (
        TFallback extends (() => infer TFbRet)
          ? TFbRet
          : TFallback
        )
    ;

  if (!obj) {
    return (isFunction(fallback) ? fallback() : fallback) as FallbackReturn;
  }

  return get(obj, prop) as TReturns;
};

export const try$ =
  <TRet, TFallback = null>(
    fn: (...args: never[]) => TRet,
    fallback?: TFallback,
  ) => {
    try {
      return fn();
    } catch {
      return (fallback ?? null) as (TFallback extends (null | undefined) ? null : TFallback);
    }
  }
;
