import {
  Router,
} from "express";
import {
  Session,
} from "../types/apollo-context";
import {
  prisma,
} from "../providers/prisma";
import {
  Role,
} from "../helpers/auth";

export default (app: Router) => {
  const TIMER_NAME = "session-user";

  app.use(async (req, res, next) => {
    res.startTime(TIMER_NAME, "Session user");
    const session = req.session as (Session | undefined);

    req.user = null;

    const end = () => {
      res.endTime(TIMER_NAME);
      return next();
    };

    if (!session?.userId) {
      return end();
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
        companies: true,
      },
    });

    if (!user) {
      return end();
    }

    const roles = user.roles.map(({ name }) => name as Role);

    req.user = {
      ...user,
      roles,
    };

    return end();
  });

  return app;
};
