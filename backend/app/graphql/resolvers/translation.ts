import {
  Arg,
  Ctx,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  applyModelsEnhanceMap,
  Translation,
  TranslationCreateInput,
} from "@generated/type-graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";

export {
  FindManyTranslationResolver,
  FindUniqueTranslationResolver,
  FindFirstTranslationResolver,
} from "@generated/type-graphql";

applyModelsEnhanceMap({
  Translation: {
    class: [
      ObjectType({ simpleResolvers: true }),
    ],
  },
});

@Resolver()
export class TranslationsResolver {
  @Query(() => [ Translation ])
  allTranslationsFor(
  @Ctx() ctx: Context,
    @Arg("language") language: string,
  ) {
    return ctx.prisma.translation.findMany({
      where: {
        language,
      },
    });
  }

  @Mutation(() => Translation, { nullable: true })
  async updateTranslation(
  @Ctx() ctx: Context,
    @Arg("data") data: TranslationCreateInput,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return await ctx.prisma.translation.upsert({
      where: {
        // eslint-disable-next-line camelcase
        key_language: {
          key: data.key,
          language: data.language,
        },
      },

      create: data,
      update: data,
    });
  }
}
