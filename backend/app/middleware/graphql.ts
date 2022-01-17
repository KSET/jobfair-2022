import {
  ApolloServer,
} from "apollo-server-express";
import {
  buildSchema,
} from "type-graphql";
import {
  Router,
} from "express";
import {
  Context,
} from "../types/apollo-context";
import {
  prisma,
} from "../providers/prisma";
import resolvers from "../graphql/resolvers";
// import {
//   authChecker,
// } from "../graphql/auth-checker";
import {
  schemaFileConfig,
} from "../graphql/schema/helpers";

export default async (app: Router) => {
  const apollo = new ApolloServer({
    context: ({ req }): Context => ({
      prisma,
      req,
      user: req.user,
      session: req.session,
    }),
    schema: await buildSchema({
      resolvers,
      validate: false,
      // authChecker,
      emitSchemaFile: schemaFileConfig(),
      authMode:
        "production" === process.env.NODE_ENV
          ? "null"
          : undefined
      ,
    }),
    introspection: "production" !== process.env.NODE_ENV,
  });

  await apollo.start();

  app.use(apollo.getMiddleware());

  return app;
};
