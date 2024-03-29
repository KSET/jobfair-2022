import session from "express-session";
import {
  Router,
} from "express";
import cookie from "cookie";
import {
  PrismaSessionStore,
} from "@quixo3/prisma-session-store";
import SuperJSON from "superjson";
import {
  prisma,
} from "../providers/prisma";

export const SESSION_KEY_PREFIX = "jobfair:session:";

export default (app: Router) => {
  const COOKIE_NAME = "jobfair-session" as const;
  const SESSION_SECRET = process.env.SESSION_SECRET || `${ Date.now().toString(36) }-${ Math.random().toString(36) }`;
  const SESSION_TTL = Number.parseInt(process.env.SESSION_TTL || "0");

  app.use((req, res, next) => {
    const sessionIdHeader = req.headers["x-session-id"];

    if (!sessionIdHeader) {
      return next();
    }

    const sessionId =
      Array.isArray(sessionIdHeader)
        ? sessionIdHeader[0]
        : sessionIdHeader
    ;

    const cookies = cookie.parse(req.headers.cookie || "");

    cookies[COOKIE_NAME] = sessionId;

    req.headers.cookie =
      Object
        .entries(cookies)
        .map(([ k, v ]) => cookie.serialize(k, v))
        .join("; ")
    ;

    next();
  });

  const sessionStore = new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      enableConcurrentSetInvocationsForSameSessionID: true,
      enableConcurrentTouchInvocationsForSameSessionID: true,
      serializer: SuperJSON,
    },
  );

  const sessionMiddleware = session({
    store: sessionStore,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    resave: false,
    rolling: true,
    cookie: {
      sameSite: "strict",
      maxAge:
        0 < SESSION_TTL
          ? SESSION_TTL * 1000
          : undefined
      ,
    },
    name: COOKIE_NAME,
  });

  app.use(sessionMiddleware as never);

  return app;
};
