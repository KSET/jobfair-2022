import {
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  Translation,

  applyModelsEnhanceMap,
} from "@generated/type-graphql";
import {
  prisma,
} from "../../providers/prisma";

export {
  FindManyTranslationResolver,
  FindUniqueTranslationResolver,
  FindFirstTranslationResolver,
  CreateTranslationResolver,
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
  allTranslations() {
    return prisma.translation.findMany();
  }
}
