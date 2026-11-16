import {
  cpus,
} from "os";
import argon2 from "argon2";

export class PasswordService {
  private static emptyHashPromise: Promise<string> | null = null;

  static hashPassword(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 2 ** 18,
      parallelism: cpus().length,
    });
  }

  static async comparePasswords(password: string, hash: string | undefined | null) {
    if (!hash) {
      await argon2
        .verify(await PasswordService.emptyHash, password)
        .catch(() => false)
      ;

      return false;
    }

    return (
      argon2
        .verify(hash, password)
        .catch(() => false)
    );
  }

  static get emptyHash() {
    if (!PasswordService.emptyHashPromise) {
      PasswordService.emptyHashPromise =
        PasswordService
          .hashPassword("")
          .catch((e) => {
            PasswordService.emptyHashPromise = null;
            throw e;
          })
      ;
    }

    return PasswordService.emptyHashPromise;
  }
}
