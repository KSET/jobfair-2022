import type {
  Request,
  Response,
} from "express";
import type {
  Session as ExpressSession,
  SessionData,
} from "express-session";
import {
  User,
  Company,
} from "@prisma/client";
import {
  prisma,
} from "../providers/prisma";
import {
  Role,
} from "../helpers/auth";

export type Session = ExpressSession & Partial<SessionData> & {
  user?: {
    id: User["id"],
    ip: string,
    userAgent: string,
    loggedInAt: Date | string,
  },
};

export type SessionUser = User & {
  roles: Role[],
  companies: Company[],
};

export type Context = {
  prisma: typeof prisma,
  req: Request,
  res: Response,
  user: SessionUser | null,
  session: Session,
};
