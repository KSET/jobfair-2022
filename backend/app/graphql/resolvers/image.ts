import {
  Image,
  ImageVariation,
} from "@generated/type-graphql";
import {
  FieldResolver,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => Image)
export class ImageFieldResolver {
  @FieldResolver(() => ImageVariation)
  full(
    @Root() image: Image,
  ): ImageVariation {
    return image.full!;
  }

  @FieldResolver(() => ImageVariation)
  thumb(
    @Root() image: Image,
  ): ImageVariation {
    return image.thumb!;
  }
}

export const transformSelect = transformSelectFor<ImageFieldResolver>({
  full(select) {
    select.full = {
      select: select.full,
    };

    return select;
  },

  thumb(select) {
    select.thumb = {
      select: select.thumb,
    };

    return select;
  },
});
