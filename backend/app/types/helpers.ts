export type Dict<Values = unknown, Keys extends (string | number | symbol) = string> = Record<Keys, Values>;

export type NonEmptyArray<T> = [ T, ...T[] ];

export type PartialArray<T> = T extends (infer R)[] ? Partial<R>[] : Partial<T>;

export type Maybe<T> = T | null | undefined;

export type MaybePromise<T> = Promise<T> | T;

export type MaybeNullable<T, IsNullable extends string = "nullable"> = IsNullable extends "nullable" ? Maybe<T> : T;

export type GQLResponse<Response, Nullable extends string = "non-nullable"> =
  Promise<PartialArray<MaybeNullable<Response, Nullable>>>
  ;

export type GQLField<Response, Nullable extends string = "non-nullable"> =
  MaybePromise<PartialArray<MaybeNullable<Response, Nullable>>>
  ;

