import graphqlFields from "graphql-fields";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  transformFields,
} from "@generated/type-graphql/helpers";
import {
  keys,
  reduce,
  toPairs,
} from "rambdax";
import {
  Dict,
} from "../../types/helpers";

type SelectTransformer<T extends Dict = Dict> = (select: T) => T;

export const toSelect =
  (
    info: GraphQLResolveInfo,
    transformSelect: SelectTransformer,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    transformSelect(transformFields(graphqlFields(info)))
;

export const transformSelectFor =
  <T>(transformers: Record<keyof T, SelectTransformer>) =>
    (select: Dict): Dict =>
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

      return select;
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
              ],
          ),
      ) as Record<Keys, SelectTransformer>
;
