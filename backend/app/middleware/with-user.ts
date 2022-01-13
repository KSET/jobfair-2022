import {
  Router,
} from "express";
import {
  Session,
} from "../types/apollo-context";
import {
  prisma,
} from "../providers/prisma";

export default (app: Router) => {
  app.use(async (req, res, next) => {
    const session = req.session as (Session | undefined);

    req.user = null;

    if (!session?.userId) {
      return next();
    }

    req.user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
    });

    next();
  });

  return app;
};
