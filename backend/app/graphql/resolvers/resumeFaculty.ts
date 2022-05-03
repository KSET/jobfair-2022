import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import {
  ResumeFaculty,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ResumeFaculty)
export class ResumeFacultyFieldResolver {
}

@InputType()
export class ResumeFacultyCreateInput {
  @Field(() => String)
    name: string = "";

  @Field(() => String)
    module: string = "";
}

export const transformSelect = transformSelectFor<ResumeFacultyFieldResolver>({});
