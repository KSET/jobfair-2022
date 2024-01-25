import "reflect-metadata";
import "@total-typescript/ts-reset";

import express from "express";
import serverTiming from "server-timing";
import withSessionMiddleware from "./middleware/session";
import withGraphqlMiddleware from "./middleware/graphql";
import withUserMiddleware from "./middleware/with-user";
import {
  SessionUser,
} from "./types/apollo-context";
import {
  registerRoutesInFolderRecursive,
} from "./helpers/route";
import {
  init as initMinio,
} from "./providers/minio";
import {
  getSentryRequestHandler,
  initSentry,
} from "./services/error-service";
import {
  CORS_ALLOWED_HEADERS_STRING,
} from "./helpers/request";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: SessionUser | null,
    }
  }
}

export async function start() {
  const success = await initMinio();

  if (!success) {
    throw new Error("Minio init failed");
  }

  const app = express();

  app.set("trust proxy", true);
  app.set("case sensitive routing", true);
  app.set("query parser", "simple");
  app.set("x-powered-by", false);

  const Sentry = initSentry();
  app.use(getSentryRequestHandler());

  app.use(serverTiming());

  app.use((req, res, next) => {
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS_STRING);
    if ("OPTIONS" === req.method) {
      return res.status(200).end();
    }
    next();
  });

  await withSessionMiddleware(app);
  await withUserMiddleware(app);
  app.use("/api", await withGraphqlMiddleware(express.Router()));
  app.use("/api", await registerRoutesInFolderRecursive(__dirname, "routes"));

  app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

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
