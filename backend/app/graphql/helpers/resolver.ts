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
} from "rambdax";
import {
  Dict,
} from "../../types/helpers";

export const toSelect =
  (
    info: GraphQLResolveInfo,
    transformSelect: (select: Dict) => Dict,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    transformSelect(transformFields(graphqlFields(info)))
;

export const transformSelectFor =
  <T>(transformers: Record<keyof T, (select: Dict) => Dict>) =>
    (select: Dict): Dict =>
      reduce(
        (acc, key) =>
          transformers[key as keyof typeof transformers]?.(acc) ?? acc
        ,
        select,
        keys(select),
      )
;
