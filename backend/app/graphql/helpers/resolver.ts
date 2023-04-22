import {
  GraphQLResolveInfo,
} from "graphql";
import {
  transformInfoIntoPrismaArgs,
} from "@generated/type-graphql/helpers";
import {
  keys,
  reduce,
  toPairs,
} from "rambdax";
import {
  Dict,
} from "../../types/helpers";

type SelectTransformer<T extends Dict = Dict> = (select: T & Dict) => T;

export const toSelect =
  <TReturn = undefined>(
    info: GraphQLResolveInfo,
    transformSelect: SelectTransformer,
  ) =>
    transformSelect(transformInfoIntoPrismaArgs(info)) as TReturn extends undefined ? ReturnType<typeof transformSelect> : TReturn
;

export const transformSelectFor =
  <T, TSelectShape extends Dict = Dict>(transformers: Record<keyof T, SelectTransformer<TSelectShape>>) =>
    (select: TSelectShape & Dict): Dict =>
      reduce(
        (acc, key) =>
          transformers[key as keyof typeof transformers]?.(acc) ?? acc
        ,
        select,
        keys(select),
      )
;

export const transformSelectDefault =
  <Key extends string>(
    key: Key,
    transformer: SelectTransformer,
  ) =>
    (select: Dict) => {
      select[key] = {
        select: transformer(select[key] as Dict),
      };

      return select as typeof select & Record<Key, { select: unknown, }>;
    }
;

export const transformSelectDefaults =
  <T, Keys extends keyof T>(mapping: Record<Keys, SelectTransformer>) =>
    Object
      .fromEntries(
        toPairs(mapping)
          .map(
            ([ key, transformer ]) =>
              [
                key,
                transformSelectDefault(key, transformer),
              ] as const,
          ),
      ) as unknown as Record<Keys, SelectTransformer>
;
