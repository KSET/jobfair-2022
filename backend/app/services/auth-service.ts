import {
  prisma,
} from "../providers/prisma";
import {
  PasswordService,
} from "./password-service";

export class AuthService {
  static async authenticateUser(identifier: string, password: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: identifier,
      },
    });

    const validPassword = await PasswordService.comparePasswords(password, user?.password);

    if (validPassword) {
      return user;
    } else {
      return null;
    }
  }
}
