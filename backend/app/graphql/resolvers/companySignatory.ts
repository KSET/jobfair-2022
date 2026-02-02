import { CompanySignatory } from "@generated/type-graphql";
import { Resolver } from "type-graphql";
import { transformSelectFor } from "../helpers/resolver";

@Resolver(() => CompanySignatory)
export class CompanySignatoryFieldResolver {}

export const transformSelect =
  transformSelectFor<CompanySignatoryFieldResolver>({});
