import "@total-typescript/ts-reset";
import "reflect-metadata";

import {
  resolve,
} from "path";
import {
  BuildSchemaOptions,
  buildSchema,
} from "type-graphql";
import resolvers from "../resolvers";
import {
  authChecker,
} from "../auth-checker";

export const schemaPath =
  () =>
    resolve(
      __dirname,
      "../",
      "../",
      "../",
      "../",
      "./graphql",
      "./schema.graphql",
    )
;

export const getSchemaFileConfig =
  () =>
    ({
      path: schemaPath(),
      sortedSchema: true,
    }) satisfies BuildSchemaOptions["emitSchemaFile"]
;

export const doBuild = (schemaFileConfig?: BuildSchemaOptions["emitSchemaFile"]) => {
  return buildSchema({
    resolvers,
    validate: false,
    authChecker,
    emitSchemaFile: schemaFileConfig ?? getSchemaFileConfig(),
    disableInferringDefaultValues: true,
  });
};

export const build =
  async () => {
    const config = getSchemaFileConfig();

    await doBuild(config);

    return config.path;
  }
;
