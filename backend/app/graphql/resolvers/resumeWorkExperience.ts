import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import {
  ResumeWorkExperience,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ResumeWorkExperience)
export class ResumeWorkExperienceFieldResolver {
}

@InputType()
export class ResumeWorkExperienceCreateInput {
  @Field(() => String)
    company: string = "";

  @Field(() => String)
    position: string = "";

  @Field(() => Date)
    start: Date = new Date();

  @Field(() => Date, { nullable: true })
    until: Date | null = null;
}

export const transformSelect = transformSelectFor<ResumeWorkExperienceFieldResolver>({});
