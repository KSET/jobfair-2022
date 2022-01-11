import {
  PrismaClient,
  Prisma,
} from "@prisma/client";

const options: Prisma.PrismaClientOptions =
  "production" === process.env.NODE_ENV
    ? {}
    : {
      log: [ "info", "query", "warn", "error" ],
      errorFormat: "pretty",
    }
;

export const prisma = new PrismaClient(options);
