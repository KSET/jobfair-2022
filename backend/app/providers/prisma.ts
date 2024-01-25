import {
  PrismaClient,
  Prisma,
} from "@prisma/client";

const envOptions: Prisma.PrismaClientOptions =
  "production" === process.env.NODE_ENV
    ? {}
    : {
      log: [ "info", "query", "warn", "error" ],
      errorFormat: "pretty",
    }
;

const options = {
  ...envOptions,
} satisfies Prisma.PrismaClientOptions;

export const prisma = new PrismaClient(options);
