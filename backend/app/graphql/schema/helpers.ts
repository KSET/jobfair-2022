import "reflect-metadata";

import {
  resolve,
} from "path";
import {
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

export const schemaFileConfig =
  () =>
    ({
      path: schemaPath(),
      sortedSchema: true,
      commentDescriptions: true,
    })
;

export const build =
  async () => {
    const config = schemaFileConfig();

    await buildSchema({
      resolvers,
      validate: false,
      authChecker,
      emitSchemaFile: config,
    });

    return config.path;
  }
;
