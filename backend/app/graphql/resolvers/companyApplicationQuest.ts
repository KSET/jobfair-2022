import {
  ApplicationQuest,
} from "@generated/type-graphql";
import {
  Resolver,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";

@Resolver(() => ApplicationQuest)
export class CompanyApplicationQuestFieldResolver {
}

export const transformSelect = transformSelectFor<CompanyApplicationQuestFieldResolver>({
});
