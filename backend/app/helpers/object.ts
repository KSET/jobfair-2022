import {
  isObject,
} from "lodash";
import {
  toPairs,
} from "rambdax";

export const deepMap = <T, R = T>(fn: (<K extends keyof T, V>({ key, value }: ({ key?: K, value?: V, })) => ({ key?: unknown, value?: unknown, })), object: T): R => {
  if (!isObject(object) || object instanceof Date) {
    return fn({ value: object }).value as R;
  }

  const boundMap = deepMap.bind(null, fn);

  if (Array.isArray(object)) {
    return object.map(boundMap) as unknown as R;
  }

  return Object.fromEntries(
    toPairs(object)
      .map(([ key, value ]) => [
        fn({ key: key as keyof T }).key,
        boundMap(value),
      ])
    ,
  ) as unknown as R;
};
