import {
  prisma,
} from "../providers/prisma";

const MISSING_KEY_MAX_LENGTH = 200;
const MISSING_KEYS_MAX_PER_REQUEST = 50;
const MISSING_KEY_LANGUAGES = [ "hr_HR", "en_US" ] as const;
const TRANSLATION_KEY_FORMAT = /^[\w-]+(?:\.[\w-]+)+$/;

export class TranslationService {
  private static isValidTranslationKey(key: string): boolean {
    return MISSING_KEY_MAX_LENGTH >= key.length && TRANSLATION_KEY_FORMAT.test(key);
  }

  public static recordMissingKeys(keys: string[]): void {
    const candidates = Array.from(
      new Set(
        keys.filter((key) => this.isValidTranslationKey(key)),
      ),
    ).slice(0, MISSING_KEYS_MAX_PER_REQUEST);

    if (0 === candidates.length) {
      return;
    }

    void prisma.translation.createMany({
      data: candidates.flatMap((key) => MISSING_KEY_LANGUAGES.map((language) => ({
        key,
        language,
        value: "",
      }))),
      skipDuplicates: true,
    }).catch((e) => {
      console.error("[TranslationService] Failed to record missing keys", e);
    });
  }

  public static async getTranslationFor<T extends string>(strings: T[], language: string): Promise<Record<T, string>> {
    const transRaw = await prisma.translation.findMany({
      where: {
        language,
        key: {
          in: strings,
        },
      },
      select: {
        key: true,
        value: true,
      },
    });

    const trans = Object.fromEntries(
      transRaw.map((t) => [ t.key, t.value ] as const),
    ) as Record<T, string>;

    const result = {} as Record<T, string>;

    for (const key of strings) {
      result[key] = trans[key] || key;
    }

    return result;
  }
}
