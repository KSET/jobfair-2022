import {
  omit,
} from "lodash/fp";
import {
  PasswordService,
} from "./password-service";
import {
  UserService,
} from "./user-service";

export class AuthService {
  static async authenticateUser(identifier: string, password: string) {
    const user = await UserService.findByEmail(identifier, {
      id: true,
      password: true,
    });

    const validPassword = await PasswordService.comparePasswords(password, user?.password);

    return user && validPassword ? omit([ "password" ], user) : null;
  }
}
