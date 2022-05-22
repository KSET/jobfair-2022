import type {
 Ref,
} from "vue";

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
