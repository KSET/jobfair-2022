import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import {
  ResumeStudyYear,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ResumeStudyYear)
export class ResumeStudyYearFieldResolver {
}

@InputType()
export class ResumeStudyYearCreateInput {
  @Field(() => Number)
    studyYear: number = 0;

  @Field(() => String)
    studyType: string = "";
}

export const transformSelect = transformSelectFor<ResumeStudyYearFieldResolver>({});
