import session from "express-session";
import connectRedis from "connect-redis";
import {
  Router,
} from "express";
import cookie from "cookie";
import {
  redis,
} from "../providers/redis";

export default async (app: Router) => {
  const COOKIE_NAME = "jobfair-session" as const;
  const SESSION_SECRET = process.env.SESSION_SECRET || `${ Date.now().toString(36) }-${ Math.random().toString(36) }`;
  const SESSION_TTL = Number.parseInt(process.env.SESSION_TTL || "0");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const RedisStore = connectRedis(session);

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

  const sessionMiddleware = session({
    store: new RedisStore({
      client: await redis(),
      prefix: "jobfair:session:",
    }) as unknown as session.Store,
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
