import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import {
  ResumeProject,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ResumeProject)
export class ResumeProjectFieldResolver {
}

@InputType()
export class ResumeProjectCreateInput {
  @Field(() => String)
    project: string = "";

  @Field(() => String)
    position: string = "";

  @Field(() => Date)
    start: Date = new Date();

  @Field(() => Date, { nullable: true })
    until: Date | null = null;
}

export const transformSelect = transformSelectFor<ResumeProjectFieldResolver>({});
