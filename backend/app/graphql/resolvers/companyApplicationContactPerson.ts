import { CompanyApplicationContactPerson } from "@generated/type-graphql";
import { Resolver } from "type-graphql";
import { transformSelectFor } from "../helpers/resolver";

@Resolver(() => CompanyApplicationContactPerson)
export class CompanyApplicationContactPersonFieldResolver {}

export const transformSelect =
  transformSelectFor<CompanyApplicationContactPersonFieldResolver>({});
