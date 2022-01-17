import type {
  Request,
} from "express";
import type {
  Session as ExpressSession,
  SessionData,
} from "express-session";
import {
  User,
} from "@prisma/client";
import {
  prisma,
} from "../providers/prisma";

export type Session = ExpressSession & Partial<SessionData> & {
  userId?: User["id"],
};

export type Context = {
  prisma: typeof prisma,
  req: Request,
  user: unknown,
  session: Session,
};
