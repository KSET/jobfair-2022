/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Ref,
} from "vue";

export type NonEmptyArray<T> = [ T, ...T[] ];

export type MaybeReadonly<T> = T | Readonly<T>;

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type RecursiveNonPartial<T> = {
  [P in keyof T]-?: RecursiveNonPartial<T[P]>;
};

export type RecursiveMutable<T> = {
  -readonly [P in keyof T]: RecursiveMutable<T[P]>;
};

// eslint-disable-next-line no-use-before-define
type RecursiveNonNullable1<T> = { [K in keyof T]: RecursiveNonNullable<T[K]> };
export type RecursiveNonNullable<T> = RecursiveNonNullable1<NonNullable<T>>;

type PathImpl<T, K extends keyof T> =
  K extends string
    ? T[K] extends Record<string, any>
      ? T[K] extends ArrayLike<any>
        ? K | `${ K }.${ PathImpl<T[K], Exclude<keyof T[K], keyof any[]>> }`
        : K | `${ K }.${ PathImpl<T[K], keyof T[K]> }`
      : K
    : never
  ;

export type Path<T> = PathImpl<T, keyof T> | keyof T;

export type PathValue<T, P extends Path<T>> =
  P extends `${ infer K }.${ infer Rest }`
    ? K extends keyof T
      ? Rest extends Path<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : P extends keyof T
      ? T[P]
      : never
  ;

export type WithSuffix<Key, Suffix extends string> =
  Key extends string
    ? `${ Key }${ Suffix }`
    : never
  ;

export type WithoutSuffix<SuffixedKey, Suffix extends string> =
  SuffixedKey extends WithSuffix<infer Key, Suffix>
    ? Key
    : never
  ;

export type Dict<Values = unknown, Keys extends (string | number | symbol) = string> = Record<Keys, Values>;

export type MaybeRef<T> = T | Ref<T>;

export type ClassDefinition = Record<string, boolean> | string;

export type ClassList = ClassDefinition | ClassDefinition[];
