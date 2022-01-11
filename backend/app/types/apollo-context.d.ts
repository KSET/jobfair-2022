import type {
  Request,
} from "express";
import {
  prisma,
} from "../providers/prisma";

export type Context = {
  prisma: typeof prisma,
  req: Request,
  user: unknown,
};
