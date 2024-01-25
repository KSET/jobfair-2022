import {
  ApolloServer,
  ApolloServerPlugin,
} from "@apollo/server";
import {
  expressMiddleware,
} from "@apollo/server/express4";
import cors from "cors";
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
import {
  doBuild as buildGraphqlSchema,
} from "../graphql/schema/helpers";
import {
  CORS_ALLOWED_HEADERS,
} from "../helpers/request";
import {
  EventsService,
} from "../services/events-service";
import {
  Dict,
} from "../types/helpers";

type ApolloContext = Omit<Context, "req" | "res">;

const PASSWORD_KEY_REGEX = /password/i;

const cleanKeys = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return (obj as unknown[]).map(cleanKeys) as T;
  }

  if (obj && "object" === typeof obj) {
    const o = { ...obj } as Dict;
    for (const [ key, value ] of Object.entries(o)) {
      if (PASSWORD_KEY_REGEX.test(key)) {
        o[key] = "********";
      } else {
        o[key] = cleanKeys(value);
      }
    }

    return o as unknown as T;
  }

  return obj;
};

const MyGqlPlugin = (): ApolloServerPlugin<ApolloContext> => ({
  requestDidStart({ request, contextValue }) {
    return Promise.resolve({
      async willSendResponse(ctx) {
        if ("mutation" !== ctx.operation?.operation) {
          return;
        }

        const resp = ctx.response.body;

        let result: unknown;
        switch (resp.kind) {
          case "single":
            result = resp.singleResult;
            break;

          case "incremental":
            result = resp.initialResult;
            break;

          default:
            break;
        }

        const key = `graphql:mutation:${ ctx.operationName ?? "$unknown$" }`;
        const userId = contextValue.user?.id;

        const variables = cleanKeys(request.variables);

        const data = {
          operationName: request.operationName,
          variables,
          userId,
          result,
        };

        await EventsService.logEvent(key, userId, data);
      },
    });
  },
});

export default async (app: Router) => {
  const apollo = new ApolloServer<ApolloContext>({
    resolvers: {
      Upload: GraphQLUpload,
    } as unknown as undefined,
    schema: await buildGraphqlSchema(),
    introspection: "production" !== process.env.NODE_ENV,
    csrfPrevention: false,
    plugins: [
      MyGqlPlugin(),
    ],
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
    graphqlUploadExpress() as never,
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
