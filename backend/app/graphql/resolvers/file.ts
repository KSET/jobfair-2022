import {
  File,
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

@Resolver(() => File)
export class FileFieldResolver {
  @FieldResolver(() => String)
  url(
    @Ctx() ctx: Context,
      @Root() file: File,
  ): string {
    const base = process.env.BASE_URL || `${ ctx.req.get("host") || "" }/api`;

    return `${ base }/file/${ file.uid }`;
  }
}

export const transformSelect = transformSelectFor<FileFieldResolver>({
  url(select) {
    delete select.url;

    select.uid = true;

    return select;
  },
});
