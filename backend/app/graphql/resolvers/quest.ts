import {
  Company,
} from "@generated/type-graphql";
import {
  Authorized,
  Ctx,
  Info,
  Query,
  Resolver,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import type {
  Prisma,
} from "@prisma/client";
import {
  Context,
} from "../../types/apollo-context";
import {
  toSelect,
} from "../helpers/resolver";
import {
  listQuestCompanies,
} from "../../services/quest-service";
import {
  getCurrentSeasonId,
  scopeCompanyApplicationsToSeason,
} from "../../services/season-service";
import {
  transformSelect as transformSelectCompanies,
} from "./company";

@Resolver(() => Company)
export class QuestResolver {
  @Authorized()
  @Query(() => [ Company ])
  async questCompanies(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
  ): Promise<Company[]> {
    const seasonId = await getCurrentSeasonId(ctx.prisma);

    if (null === seasonId) {
      return [];
    }

    const select = toSelect<Prisma.CompanySelect>(info, transformSelectCompanies);

    select.id = true;

    scopeCompanyApplicationsToSeason(select, seasonId);

    return listQuestCompanies(ctx.prisma, seasonId, select) as unknown as Promise<Company[]>;
  }
}
