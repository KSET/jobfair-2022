import "reflect-metadata";

import express from "express";
import {
  User,
} from "@prisma/client";
import withSessionMiddleware from "./middleware/session";
import withGraphqlMiddleware from "./middleware/graphql";
import withUserMiddleware from "./middleware/with-user";

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
  const app = express();

  app.set("trust proxy", 1);

  await withSessionMiddleware(app);
  await withUserMiddleware(app);
  app.use("/api", await withGraphqlMiddleware(express.Router()));

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
