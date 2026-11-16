import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
} from "type-graphql";
import {
  Prisma,
} from "@prisma/client";
import {
  Industry,
} from "@generated/type-graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";

export {
  FindManyIndustryResolver,
} from "@generated/type-graphql";

@InputType()
class UpdateIndustryInput {
  @Field(() => String, { nullable: true })
    name?: string | null;

  @Field(() => String, { nullable: true })
    nameEn?: string | null;
}

const industryEnDisplayName = (name: string, nameEn: string) => nameEn || name;

const isEnDisplayNameTaken = async (
  db: Prisma.TransactionClient,
  displayNameEn: string,
  exceptId?: number,
) => {
  const existing = await db.industry.findFirst({
    where: {
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
      OR: [
        {
          nameEn: {
            equals: displayNameEn,
            mode: "insensitive",
          },
        },
        {
          nameEn: "",
          name: {
            equals: displayNameEn,
            mode: "insensitive",
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(existing);
};

const isRecoverablePrismaError = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError
  && [
    // Record not found
    "P2025",
    // Unique constraint violation
    "P2002",
    // Serialization failure (concurrent write)
    "P2034",
  ].includes(e.code)
;

const SERIALIZABLE = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
};

const MAX_TRANSACTION_ATTEMPTS = 3;

const isSerializationFailure = (e: unknown) =>
  e instanceof Prisma.PrismaClientKnownRequestError
  && "P2034" === e.code
;

const runSerializable = async <T>(
  prisma: Context["prisma"],
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await prisma.$transaction(fn, SERIALIZABLE);
    } catch (e) {
      if (attempt >= MAX_TRANSACTION_ATTEMPTS || !isSerializationFailure(e)) {
        throw e;
      }
    }
  }
};

@Resolver()
export class IndustryResolver {
  @Mutation(() => Industry, { nullable: true })
  async createIndustry(
    @Ctx() ctx: Context,
      @Arg("name") name: string,
      @Arg("nameEn", () => String, { nullable: true }) nameEn?: string | null,
  ): Promise<Industry | null> {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const trimmedName = name.trim();
    const trimmedNameEn = nameEn?.trim() ?? "";
    if (!trimmedName) {
      return null;
    }

    try {
      const industry = await runSerializable(ctx.prisma, async (tx) => {
        if (await isEnDisplayNameTaken(tx, industryEnDisplayName(trimmedName, trimmedNameEn))) {
          return null;
        }

        return tx.industry.create({
          data: {
            name: trimmedName,
            nameEn: trimmedNameEn,
          },
        });
      });

      if (industry) {
        void EventsService.logEvent("industry:create", ctx.user.id, { name: trimmedName, nameEn: trimmedNameEn });
      }

      return industry;
    } catch (e) {
      if (isRecoverablePrismaError(e)) {
        return null;
      }

      throw e;
    }
  }

  @Mutation(() => Industry, { nullable: true })
  async updateIndustry(
    @Ctx() ctx: Context,
      @Arg("name") name: string,
      @Arg("data", () => UpdateIndustryInput) input: UpdateIndustryInput,
  ): Promise<Industry | null> {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const newName = input.name?.trim();
    const newNameEn = input.nameEn?.trim();

    if ("" === newName) {
      return null;
    }

    if (undefined === newName && undefined === newNameEn) {
      return null;
    }

    try {
      const result = await runSerializable(ctx.prisma, async (tx) => {
        const existing = await tx.industry.findUnique({
          where: {
            name,
          },
        });

        if (!existing) {
          return null;
        }

        const finalName = newName ?? existing.name;
        const finalNameEn = newNameEn ?? existing.nameEn;

        if (finalName === existing.name && finalNameEn === existing.nameEn) {
          return { industry: existing, existing };
        }

        if (await isEnDisplayNameTaken(tx, industryEnDisplayName(finalName, finalNameEn), existing.id)) {
          return null;
        }

        const industry = await tx.industry.update({
          where: {
            id: existing.id,
          },
          data: {
            name: finalName,
            nameEn: finalNameEn,
          },
        });

        return { industry, existing };
      });

      if (!result) {
        return null;
      }

      const { industry, existing } = result;

      if (industry.name !== existing.name) {
        void EventsService.logEvent("industry:rename", ctx.user.id, { old: existing.name, new: industry.name });
      }

      if (industry.nameEn !== existing.nameEn) {
        void EventsService.logEvent("industry:update", ctx.user.id, { name: industry.name, nameEn: industry.nameEn });
      }

      return industry;
    } catch (e) {
      if (isRecoverablePrismaError(e)) {
        return null;
      }

      throw e;
    }
  }
}
