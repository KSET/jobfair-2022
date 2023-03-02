import {
  ApolloServer,
} from "@apollo/server";
import {
  expressMiddleware,
} from "@apollo/server/express4";
import cors from "cors";
import {
  buildSchema,
} from "type-graphql";
import {
  Router,
} from "express";
import {
  GraphQLUpload,
  graphqlUploadExpress,
} from "graphql-upload";
import bodyParser from "body-parser";
import {
  Context,
} from "../types/apollo-context";
import {
  prisma,
} from "../providers/prisma";
import resolvers from "../graphql/resolvers";
import {
  authChecker,
} from "../graphql/auth-checker";
import {
  schemaFileConfig,
} from "../graphql/schema/helpers";
import {
  CORS_ALLOWED_HEADERS,
} from "../helpers/request";

type ApolloContext = Omit<Context, "req" | "res">;

export default async (app: Router) => {
  const apollo = new ApolloServer<ApolloContext>({
    resolvers: {
      Upload: GraphQLUpload,
    } as unknown as undefined,
    schema: await buildSchema({
      resolvers,
      validate: false,
      authChecker,
      emitSchemaFile: schemaFileConfig(),
      authMode:
        "production" === process.env.NODE_ENV
          ? "null"
          : undefined
      ,
    }),
    introspection: "production" !== process.env.NODE_ENV,
    csrfPrevention: false,
  });

  await apollo.start();

  app.use(
    "/graphql",
    cors({
      origin: true,
      credentials: true,
      methods: [ "GET", "POST", "OPTIONS" ],
      allowedHeaders: CORS_ALLOWED_HEADERS,
    }),
    bodyParser.json(),
    graphqlUploadExpress(),
    expressMiddleware(apollo, {
      context: ({ req, res }) => Promise.resolve({
        prisma,
        req,
        res,
        user: req.user,
        session: req.session,
      }),
    }),
  );

  return app;
};
