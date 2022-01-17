import {
  cpus,
} from "os";
import argon2 from "argon2";

export class PasswordService {
  static hashPassword(password: string) {
    return argon2.hash(password, {
      type: argon2.argon2id,
      timeCost: 2,
      memoryCost: 2 ** 18,
      parallelism: cpus().length,
    });
  }

  static async comparePasswords(password: string, hash: string | undefined | null) {
    const emptyHash = await PasswordService.emptyHash;

    return (
      argon2
        .verify(
          hash ?? emptyHash,
          password,
        )
        .catch(() => false)
    );
  }

  static get emptyHash() {
    return PasswordService.hashPassword("");
  }
}
