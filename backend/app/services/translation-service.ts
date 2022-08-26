import {
  prisma,
} from "../providers/prisma";

export class TranslationService {
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
