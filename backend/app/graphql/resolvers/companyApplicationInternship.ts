import { ApplicationInternship, Company, CompanyApplication, FindManyApplicationInternshipArgs } from "@generated/type-graphql";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { GraphQLResolveInfo } from "graphql";
import { Context } from "../../types/apollo-context";
import {
  transformSelect as transformSelectImage,
} from "./image";
import { Dict } from "../../types/helpers";
import { Role } from "../../helpers/auth";
import { normalizeCompanyName } from "../../helpers/string";
import axios from "axios";


@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipFieldResolver {
  @FieldResolver(() => Company, { nullable: true })
  company(
    @Root() internship: ApplicationInternship,
  ): Company | null {
    return internship.forApplication?.forCompany ?? null;
  }
}
export const transformSelect = transformSelectFor<CompanyApplicationInternshipFieldResolver>({
  company(select) {

    const rasterLogoSelection = (
      (select as Dict)?.company as Dict
    )?.rasterLogo as Dict;

    select.forApplication = {
      select: {
        forCompany: {
          select: {
            uid: true,
            brandName: true,
            rasterLogo: {
              select: transformSelectImage(rasterLogoSelection),
            },
          },
        },
      },
    };

    delete select.company;
    return select;
  }
});


@ObjectType()
class SyncResult {
  @Field(() => [ String ])
    createdCompanies: string[] = [];

  @Field(() => [ String ])
    updatedCompanies: string[] = [];

  @Field(() => [ String ])
    deletedCompanies: string[] = [];

  @Field(() => [ String ])
    unmatched: string[] = [];
}

@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipResolver {
  @Query(() => [ ApplicationInternship ])
  internships(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationInternshipArgs,
  ) {
    const now = new Date();

    return ctx.prisma.applicationInternship.findMany({
          ...args,
          cursor: undefined,
          where: {
            ...(
              args.where
                ? args.where
                : {
                  forApplication: {
                  forSeason: {
                    startsAt: {
                      lte: now,
                    },
                    endsAt: {
                      gte: now,
                    },
                  }
                }
              }
            )
          },
          select: toSelect(info, transformSelect),
          orderBy: {
            forApplication: {
              forCompany: {
                brandName: "asc",
              },
            },
          },
    })
  }

  @Mutation(() => SyncResult)
  @Authorized(Role.Admin)
  async syncSummerInternships(
    @Arg("season") seasonUid: string,
    @Ctx() ctx: Context,
  ): Promise<SyncResult> {
    const url = process.env.SUMMER_INTERNSHIPS_URL;
    if (!url) {
      throw new Error("SUMMER_INTERNSHIPS_URL not configured");
    }
    const { data: externalInternships } = await axios.get<Array<{
      company: string;
      position: string;
      description: string;
      places: string;
      begins: string;
      ends: string;
      signed: string;
    }>>(url, { timeout: 15000 });

    const season = await ctx.prisma.season.findUnique({
      where: { uid: seasonUid },
    });

    if (!season) {
      throw new Error(`Season "${ seasonUid }" not found`);
    }

    const applications = await ctx.prisma.companyApplication.findMany({
      where: { forSeasonId: season.id },
      select: {
        id: true,
        forCompany: {
          select: { legalName: true, brandName: true },
        },
      },
    });

    const appMap = new Map(applications.map((a) => [ normalizeCompanyName(a.forCompany.legalName), a ]));

    const appById = new Map(applications.map((a) => [ a.id, a ]));

    const existingInSeason = await ctx.prisma.applicationInternship.findMany({
      where: { forApplicationId: { in: applications.map((a) => a.id) } },
      select: { id: true, forApplicationId: true, position: true, workingPeriodStart: true, workingPeriodEnd: true },
    });

    const existingMap = new Map(
      existingInSeason.map((e) => [
        `${ e.forApplicationId }:${ e.position }:${ e.workingPeriodStart.getTime() }:${ e.workingPeriodEnd.getTime() }`,
        e,
      ]),
    );

    const createdCompanies: string[] = [];
    const updatedCompanies: string[] = [];
    const unmatched: string[] = [];
    const syncedIds = new Set<number>();

    for (const item of externalInternships) {
      const app = appMap.get(normalizeCompanyName(item.company));

      if (!app) {
        unmatched.push(item.company);
        continue;
      }

      const workingPeriodStart = new Date(item.begins);
      const workingPeriodEnd = new Date(item.ends);
      const existingKey = `${ app.id }:${ item.position }:${ workingPeriodStart.getTime() }:${ workingPeriodEnd.getTime() }`;
      const existing = existingMap.get(existingKey);

      const upserted = await ctx.prisma.applicationInternship.upsert({
        where: {
          forApplicationId_position_workingPeriodStart_workingPeriodEnd: {
            forApplicationId: app.id,
            position: item.position,
            workingPeriodStart,
            workingPeriodEnd,
          },
        },
        create: {
          forApplicationId: app.id,
          position: item.position,
          description: item.description,
          workingPeriodStart,
          workingPeriodEnd,
          places: item.places ? parseInt(item.places, 10) : null,
          signed: item.signed === "1",
          externalCompany: item.company,
        },
        update: {
          description: item.description,
          places: item.places ? parseInt(item.places, 10) : null,
          signed: item.signed === "1",
          externalCompany: item.company,
        },
        select: { id: true },
      });

      syncedIds.add(upserted.id);

      if (existing) {
        updatedCompanies.push(app.forCompany.brandName);
      } else {
        createdCompanies.push(app.forCompany.brandName);
      }
    }

    const toDelete = existingInSeason.filter((e) => !syncedIds.has(e.id));
    const deletedCompanies = toDelete.map(
      (e) => appById.get(e.forApplicationId)?.forCompany.brandName ?? e.forApplicationId.toString(),
    );
    if (toDelete.length > 0) {
      await ctx.prisma.applicationInternship.deleteMany({
        where: { id: { in: toDelete.map((e) => e.id) } },
      });
    }

    return { createdCompanies, updatedCompanies, deletedCompanies, unmatched };
  }
}
