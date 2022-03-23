export type Dict<Values = unknown, Keys extends (string | number | symbol) = string> = Record<Keys, Values>;

export type NonEmptyArray<T> = [ T, ...T[] ];
