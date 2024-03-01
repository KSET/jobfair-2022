import {
  Field,
  FieldResolver,
  InputType,
  Resolver,
  Root,
} from "type-graphql";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import {
  ApplicationPresenter,
  Image,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  transformSelect as transformSelectPhoto,
} from "./image";

@Resolver(() => ApplicationPresenter)
export class CompanyApplicationPresenterFieldResolver {
  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() presenter: ApplicationPresenter,
  ): Image | null {
    return presenter.photo || null;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationPresenterFieldResolver>({
  photo(select) {
    select.photo = {
      select: transformSelectPhoto(select.photo as Record<string, unknown>),
    };

    return select;
  },
});

@InputType()
export class PresenterCreateInput {
  @Field()
    firstName: string = "";

  @Field()
    lastName: string = "";

  @Field()
    bioEn: string = "";

  @Field()
    bioHr: string = "";

  @Field(() => GraphQLUpload, { nullable: true })
    photo: FileUpload | null = null;
}
