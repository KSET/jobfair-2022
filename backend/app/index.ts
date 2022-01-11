import "reflect-metadata";

import express from "express";
import {
  ApolloServer,
} from "apollo-server-express";
import {
  buildSchema,
} from "type-graphql";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import {
  User,
} from "@prisma/client";
import resolvers from "./graphql/resolvers";
import {
  prisma,
} from "./providers/prisma";
import {
  Context,
} from "./types/apollo-context";
import {
  authChecker,
} from "./graphql/auth-checker";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: null | User,
    }
  }
}

export async function start() {
  const apollo = new ApolloServer({
    context: ({ req }) => ({
      prisma,
      req,
      user: req.user,
    }) as Context,
    schema: await buildSchema({
      resolvers,
      validate: false,
      authChecker,
      authMode:
        "production" === process.env.NODE_ENV
          ? "null"
          : undefined
      ,
    }),
    introspection: "production" !== process.env.NODE_ENV,
  });

  try {
    await apollo.start();
  } catch (e) {
    process.exit(1);
  }

  const app = express();
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  app.set("trust proxy", true);

  app.use((req, res, next) => {
    req.user = null;

    next();
  });

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: "jobfair:session:",
      }) as unknown as session.Store,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || `${ Date.now().toString(36) }-${ Math.random().toString(36) }`,
      resave: false,
      cookie: {
        sameSite: "strict",
      },
      name: "jobfair-session",
    }),
  );

  app.use("/api", apollo.getMiddleware());

  const PORT = Number(process.env.PORT) || 3001;
  const HOST = process.env.HOST || "localhost";

  await new Promise((resolve) => {
    app.listen(PORT, HOST, () => resolve(true));
  });

  return {
    host: HOST,
    port: PORT,
    message: "",
  };
}
