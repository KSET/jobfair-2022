import { ApplicationInternship } from "@generated/type-graphql";
import {
  Field,
  InputType,
  Resolver,
} from "type-graphql";
import { transformSelectFor } from "../helpers/resolver";


@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipFieldResolver {
}
export const transformSelect = transformSelectFor<CompanyApplicationInternshipFieldResolver>({});

@InputType()
export class InternshipCreateInput {
  @Field()
    position: string = "";

  @Field()
    competencies: string = "";

  @Field()
    description: string = "";

  @Field()
    workingPeriod: string = "";

  @Field()
    duration: string = "";
}

