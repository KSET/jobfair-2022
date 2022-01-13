import session from "express-session";
import connectRedis from "connect-redis";
import redis from "redis";
import {
  Router,
} from "express";
import cookie from "cookie";

export default (app: Router) => {
  const COOKIE_NAME = "jobfair-session" as const;
  const SESSION_SECRET = process.env.SESSION_SECRET || `${ Date.now().toString(36) }-${ Math.random().toString(36) }`;
  const SESSION_TTL = Number.parseInt(process.env.SESSION_TTL || "0") || undefined;

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

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

  app.use(session({
    store: new RedisStore({
      client: redisClient,
      prefix: "jobfair:session:",
    }) as unknown as session.Store,
    saveUninitialized: false,
    secret: SESSION_SECRET,
    resave: false,
    rolling: true,
    cookie: {
      sameSite: "strict",
      maxAge: SESSION_TTL,
    },
    name: COOKIE_NAME,
  }));

  return app;
};
