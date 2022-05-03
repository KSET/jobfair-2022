import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import {
  ResumeVolunteerExperience,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ResumeVolunteerExperience)
export class ResumeVolunteerExperienceFieldResolver {
}

@InputType()
export class ResumeVolunteerExperienceCreateInput {
  @Field(() => String)
    organisation: string = "";

  @Field(() => String)
    position: string = "";

  @Field(() => Date)
    start: Date = new Date();

  @Field(() => Date, { nullable: true })
    until: Date | null = null;
}

export const transformSelect = transformSelectFor<ResumeVolunteerExperienceFieldResolver>({});
