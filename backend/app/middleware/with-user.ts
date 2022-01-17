import {
  Router,
} from "express";
import {
  omit,
} from "rambdax";
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
        usersRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return end();
    }

    const roles = user.usersRoles.map(({ role }) => role.name as Role);

    req.user = {
      ...omit(
        [
          "usersRoles",
        ],
        user,
      ),
      roles,
    };

    return end();
  });

  return app;
};
