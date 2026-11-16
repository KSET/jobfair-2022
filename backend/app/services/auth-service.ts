import {
  omit,
} from "lodash/fp";
import type {
  Prisma,
} from "@prisma/client";
import {
  prisma,
} from "../providers/prisma";
import {
  PasswordService,
} from "./password-service";

export class AuthService {
  static async findUserByEmail<S extends Prisma.UserSelect>(
    identifier: string,
    select: S,
    client: Prisma.TransactionClient = prisma,
  ): Promise<Prisma.UserGetPayload<{ select: S, }> | null> {
    const findByEmail = (email: string) => client.user.findUnique({
      where: {
        email,
      },
      select,
    }) as Promise<Prisma.UserGetPayload<{ select: S, }> | null>;

    const email = identifier.trim();
    const lowercaseEmail = email.toLowerCase();

    return (
      await findByEmail(email)
      ?? (email !== lowercaseEmail ? await findByEmail(lowercaseEmail) : null)
    );
  }

  static async authenticateUser(identifier: string, password: string) {
    const user = await AuthService.findUserByEmail(identifier, {
      id: true,
      password: true,
    });

    const validPassword = await PasswordService.comparePasswords(password, user?.password);

    return user && validPassword ? omit([ "password" ], user) : null;
  }
}
