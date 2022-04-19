import {
  Image,
  ImageVariation,
} from "@generated/type-graphql";
import {
  Ctx,
  FieldResolver,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";

@Resolver(() => Image)
export class ImageFieldResolver {
  @FieldResolver(() => ImageVariation)
  full(
    @Root() image: Image,
  ): ImageVariation {
    return image.full!;
  }

  @FieldResolver(() => String)
  fullUrl(
    @Ctx() ctx: Context,
      @Root() image: Image,
  ): string {
    const base = process.env.BASE_URL || `${ ctx.req.get("host") || "" }/api`;

    return `${ base }/i/${ image.uid }/full`;
  }

  @FieldResolver(() => ImageVariation)
  thumb(
    @Root() image: Image,
  ): ImageVariation {
    return image.thumb!;
  }

  @FieldResolver(() => String)
  thumbUrl(
    @Ctx() ctx: Context,
      @Root() image: Image,
  ): string {
    const base = process.env.BASE_URL || `${ ctx.req.get("host") || "" }/api`;

    return `${ base }/i/${ image.uid }/thumb`;
  }
}

export const transformSelect = transformSelectFor<ImageFieldResolver>({
  full(select) {
    select.full = {
      select: select.full,
    };

    return select;
  },

  fullUrl(select) {
    delete select.fullUrl;

    select.uid = true;

    return select;
  },

  thumb(select) {
    select.thumb = {
      select: select.thumb,
    };

    return select;
  },

  thumbUrl(select) {
    delete select.thumbUrl;

    select.uid = true;

    return select;
  },
});
