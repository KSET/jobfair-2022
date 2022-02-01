import graphqlFields from "graphql-fields";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  transformFields,
} from "@generated/type-graphql/helpers";

export const toSelect =
  (
    info: GraphQLResolveInfo,
    transformSelect: <T extends Record<string, unknown>>(select: T) => T,
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    transformSelect(transformFields(graphqlFields(info)))
;
