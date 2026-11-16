import type {
  Prisma,
} from "@prisma/client";
import {
  prisma,
} from "../providers/prisma";

export class UserService {
  static normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  static findByEmail<S extends Prisma.UserSelect>(
    email: string,
    select: S,
    client: Prisma.TransactionClient = prisma,
  ) {
    return client.user.findUnique({
      where: {
        email: UserService.normalizeEmail(email),
      },
      select,
    }) as Promise<Prisma.UserGetPayload<{ select: S, }> | null>;
  }
}
