import { ApplicationInternship, Company, CompanyApplication, FindManyApplicationInternshipArgs } from "@generated/type-graphql";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Int,
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
abstract class InternshipPayloadObjectBase {
  @Field()
    externalCompany!: string;

  @Field()
    position!: string;

  @Field()
    description!: string;

  @Field()
    workingPeriodStart!: Date;

  @Field()
    workingPeriodEnd!: Date;

  @Field(() => Int, { nullable: true })
    places!: number | null;

  @Field(() => Boolean, { nullable: true })
    signed!: boolean | null;
}

@InputType()
abstract class InternshipPayloadInputBase {
  @Field()
    externalCompany!: string;

  @Field()
    position!: string;

  @Field()
    description!: string;

  @Field()
    workingPeriodStart!: Date;

  @Field()
    workingPeriodEnd!: Date;

  @Field(() => Int, { nullable: true })
    places!: number | null;

  @Field(() => Boolean, { nullable: true })
    signed!: boolean | null;
}

@ObjectType()
class UnmatchedInternship extends InternshipPayloadObjectBase {}

@ObjectType()
class SyncResult {
  @Field(() => [ String ])
    createdCompanies: string[] = [];

  @Field(() => [ String ])
    updatedCompanies: string[] = [];

  @Field(() => [ String ])
    deletedCompanies: string[] = [];

  @Field(() => [ UnmatchedInternship ])
    unmatched: UnmatchedInternship[] = [];
}

@InputType()
class LinkUnmatchedInternshipInput extends InternshipPayloadInputBase {
  @Field()
    companyUid!: string;

  @Field()
    seasonUid!: string;
}

type RawExternalInternship = {
  company: string;
  position: string;
  description: string;
  places: string;
  begins: string;
  ends: string;
  signed: string;
};

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
            signed: true,
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

  @Query(() => [ ApplicationInternship ])
  @Authorized(Role.Admin)
  internshipsForAdmin(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationInternshipArgs,
  ) {
    const now = new Date();

    return ctx.prisma.applicationInternship.findMany({
          ...args,
          cursor: undefined,
          where: args.where ?? {
            forApplication: {
              forSeason: {
                startsAt: { lte: now },
                endsAt: { gte: now },
              },
            },
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
      throw new Error("SUMMER_INTERNSHIPS_URL nije konfiguriran.");
    }
    const { data: externalInternships } = await axios.get<RawExternalInternship[]>(url, { timeout: 15000 });

    const season = await ctx.prisma.season.findUnique({
      where: { uid: seasonUid },
    });

    if (!season) {
      throw new Error(`Season "${ seasonUid }" not found`);
    }

    if (externalInternships.length === 0) {
      throw new Error("Vanjski izvor nije vratio nijednu praksu — sinkronizacija je prekinuta kako se postojeći podaci ne bi obrisali.");
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

    const appMap = new Map<string, typeof applications[number]>();
    for (const a of applications) {
      const key = normalizeCompanyName(a.forCompany.legalName);
      if (appMap.has(key)) {
        console.warn(`Multiple CompanyApplications in season "${ seasonUid }" normalize to "${ key }": "${ appMap.get(key)!.forCompany.legalName }" and "${ a.forCompany.legalName }"`);
      }
      appMap.set(key, a);
    }

    const appById = new Map(applications.map((a) => [ a.id, a ]));

    const existingInSeason = await ctx.prisma.applicationInternship.findMany({
      where: { forApplicationId: { in: applications.map((a) => a.id) } },
      select: {
        id: true,
        forApplicationId: true,
        position: true,
        workingPeriodStart: true,
        workingPeriodEnd: true,
        externalCompany: true,
      },
    });

    const existingMap = new Map(
      existingInSeason.map((e) => [
        `${ e.forApplicationId }:${ e.position }:${ e.workingPeriodStart.getTime() }:${ e.workingPeriodEnd.getTime() }`,
        e,
      ]),
    );

    const memoryMap = new Map<string, { id: number; forApplicationId: number }>();
    for (const e of existingInSeason) {
      if (e.externalCompany == null) {
        continue;
      }
      const key = `${ normalizeCompanyName(e.externalCompany) }|${ e.position }|${ e.workingPeriodStart.getTime() }|${ e.workingPeriodEnd.getTime() }`;
      memoryMap.set(key, { id: e.id, forApplicationId: e.forApplicationId });
    }

    const createdCompanies: string[] = [];
    const updatedCompanies: string[] = [];
    const unmatched: UnmatchedInternship[] = [];
    const syncedIds = new Set<number>();

    const deletedCompanies = await ctx.prisma.$transaction(async (tx) => {
      for (const item of externalInternships) {
        const { company: externalCompany, position, description } = item;
        const workingPeriodStart = new Date(item.begins);
        const workingPeriodEnd = new Date(item.ends);
        if (Number.isNaN(workingPeriodStart.getTime()) || Number.isNaN(workingPeriodEnd.getTime())) {
          console.warn(`Skipping internship with invalid date(s): company="${ externalCompany }", position="${ position }"`);
          continue;
        }
        const placesParsed = item.places ? parseInt(item.places, 10) : NaN;
        const places = Number.isNaN(placesParsed) ? null : placesParsed;
        const signed = item.signed === "1" ? true : item.signed === "0" ? false : null;

        let app = appMap.get(normalizeCompanyName(externalCompany));

        if (!app) {
          const memoryKey = `${ normalizeCompanyName(externalCompany) }|${ position }|${ workingPeriodStart.getTime() }|${ workingPeriodEnd.getTime() }`;
          const memory = memoryMap.get(memoryKey);
          if (memory) {
            app = appById.get(memory.forApplicationId);
          }
        }

        if (!app) {
          unmatched.push({ externalCompany, position, description, workingPeriodStart, workingPeriodEnd, places, signed });
          continue;
        }

        const existingKey = `${ app.id }:${ position }:${ workingPeriodStart.getTime() }:${ workingPeriodEnd.getTime() }`;
        const existing = existingMap.get(existingKey);

        const upserted = await tx.applicationInternship.upsert({
          where: {
            forApplicationId_position_workingPeriodStart_workingPeriodEnd: {
              forApplicationId: app.id,
              position,
              workingPeriodStart,
              workingPeriodEnd,
            },
          },
          create: {
            forApplicationId: app.id,
            position,
            description,
            workingPeriodStart,
            workingPeriodEnd,
            places,
            signed,
            externalCompany,
          },
          update: {
            description,
            places,
            signed,
            externalCompany,
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

      const toDelete = existingInSeason.filter(
        (e) =>
          !syncedIds.has(e.id)
          && e.externalCompany != null,
      );
      const deletedCompaniesInner = toDelete.map(
        (e) => appById.get(e.forApplicationId)?.forCompany.brandName ?? e.forApplicationId.toString(),
      );
      if (toDelete.length > 0) {
        await tx.applicationInternship.deleteMany({
          where: { id: { in: toDelete.map((e) => e.id) } },
        });
      }

      return deletedCompaniesInner;
    });

    return { createdCompanies, updatedCompanies, deletedCompanies, unmatched };
  }

  @Mutation(() => ApplicationInternship)
  @Authorized(Role.Admin)
  async linkUnmatchedInternship(
    @Arg("input") input: LinkUnmatchedInternshipInput,
    @Ctx() ctx: Context,
  ): Promise<ApplicationInternship> {
    const application = await ctx.prisma.companyApplication.findFirst({
      where: {
        forCompany: { uid: input.companyUid },
        forSeason: { uid: input.seasonUid },
      },
      select: { id: true },
    });

    if (!application) {
      throw new Error("Nije pronađena prijava za odabranu firmu u ovoj sezoni.");
    }

    return ctx.prisma.$transaction(async (tx) => {
      const existing = await tx.applicationInternship.findFirst({
        where: {
          externalCompany: input.externalCompany,
          position: input.position,
          workingPeriodStart: input.workingPeriodStart,
          workingPeriodEnd: input.workingPeriodEnd,
          forApplication: { forSeason: { uid: input.seasonUid } },
        },
      });
      if (existing && existing.forApplicationId !== application.id) {
        await tx.applicationInternship.delete({ where: { id: existing.id } });
      }

      return tx.applicationInternship.upsert({
        where: {
          forApplicationId_position_workingPeriodStart_workingPeriodEnd: {
            forApplicationId: application.id,
            position: input.position,
            workingPeriodStart: input.workingPeriodStart,
            workingPeriodEnd: input.workingPeriodEnd,
          },
        },
        create: {
          forApplicationId: application.id,
          position: input.position,
          description: input.description,
          workingPeriodStart: input.workingPeriodStart,
          workingPeriodEnd: input.workingPeriodEnd,
          places: input.places ?? null,
          signed: input.signed ?? null,
          externalCompany: input.externalCompany,
        },
        update: {
          description: input.description,
          places: input.places ?? null,
          signed: input.signed ?? null,
          externalCompany: input.externalCompany,
        },
      });
    });
  }
}
