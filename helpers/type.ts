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
