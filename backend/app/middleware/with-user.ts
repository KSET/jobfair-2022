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
  app.use(async (req, res, next) => {
    const session = req.session as (Session | undefined);

    req.user = null;

    if (!session?.userId) {
      return next();
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
      return next();
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

    return next();
  });

  return app;
};
