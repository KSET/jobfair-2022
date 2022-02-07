import {
  Field,
  InputType,
} from "type-graphql";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";

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

  @Field(() => GraphQLUpload)
    photo: FileUpload | null = null;
}
