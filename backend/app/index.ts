import "reflect-metadata";

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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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

  app.set("trust proxy", 1);
  app.set("case sensitive routing", true);
  app.set("query parser", "simple");
  app.set("x-powered-by", false);

  app.use(serverTiming());

  await withSessionMiddleware(app);
  await withUserMiddleware(app);
  app.use("/api", await withGraphqlMiddleware(express.Router()));
  app.use("/api", await registerRoutesInFolderRecursive(__dirname, "routes"));

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
