import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  MaybePromise,
  Mutation,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import {
  ApplicationTalk,
  ApplicationWorkshop,
  CompanyApplication,
} from "@generated/type-graphql";
import {
  omit,
} from "rambdax";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  CompanyApplicationValidation,
} from "../../services/validation-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  TalkCreateInput,
  transformSelect as transformSelectTalks,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectWorkshops,
  WorkshopCreateInput,
} from "./companyApplicationWorkshop";

@Resolver(() => CompanyApplication)
export class CompanyApplicationFieldResolver {
  @FieldResolver(() => ApplicationTalk, { nullable: true })
  talk(
    @Root() application: CompanyApplication,
  ): ApplicationTalk | null {
    return application.talk || null;
  }

  @FieldResolver(() => ApplicationWorkshop, { nullable: true })
  workshop(
    @Root() application: CompanyApplication,
  ): ApplicationWorkshop | null {
    return application.workshop || null;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationFieldResolver>({
  talk(select) {
    select.talk = {
      select: transformSelectTalks(select.talk as Record<string, unknown>),
    };

    return select;
  },

  workshop(select) {
    select.workshop = {
      select: transformSelectWorkshops(select.workshop as Record<string, unknown>),
    };

    return select;
  },
});

@InputType()
class CompanyApplicationCreateInput {
  @Field()
    vat: string = "";

  @Field(() => String, { nullable: true })
    booth: string | null = null;

  @Field(() => TalkCreateInput, { nullable: true })
    talk: TalkCreateInput | null = null;

  @Field(() => WorkshopCreateInput, { nullable: true })
    workshop: WorkshopCreateInput | null = null;

  @Field(() => Boolean)
    wantsCocktail: boolean = false;

  @Field(() => Boolean)
    wantsPanel: boolean = false;
}

@ObjectType()
class CreateCompanyApplicationResponse extends ValidationResponseFor(CompanyApplication) {
}

@Resolver(() => CompanyApplication)
export class CompanyApplicationCreateResolver {
  @Mutation(() => CreateCompanyApplicationResponse, { nullable: true })
  async createCompanyApplication(
    @Ctx() ctx: Context,
      @Arg("info") info: CompanyApplicationCreateInput,
  ): Promise<CreateCompanyApplicationResponse | null> {
    if (!ctx.user) {
      return null;
    }

    const validation = await CompanyApplicationValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    const canPickPanelOrCocktail = Boolean(info.talk || info.workshop || info.booth);

    if (!canPickPanelOrCocktail && (info.wantsCocktail || info.wantsPanel)) {
      return {
        errors: [
          {
            field: "entity",
            message: "You may not pick only cocktail and/or panel",
          },
        ],
      };
    }

    info.vat = info.vat.toUpperCase();

    const isInCompany = ctx.user.companies.some((company) => company.vat === info.vat);

    if (!isInCompany && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return {
        errors: [
          {
            field: "entity",
            message: "You can not edit the company",
          },
        ],
      };
    }

    const company = await ctx.prisma.company.findUnique({
      where: {
        vat: info.vat,
      },
    });

    if (!company) {
      return {
        errors: [
          {
            field: "entity",
            message: "Company does not exist",
          },
        ],
      };
    }

    const currentSeason = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!currentSeason) {
      return {
        errors: [
          {
            field: "entity",
            message: "Season is closed",
          },
        ],
      };
    }

    const talkInfo =
      info.talk
        ? {
          create: {
            ...omit(
              [
                "presenter",
              ],
              info.talk,
            ),
            category: {
              connect: {
                name: info.talk.category,
              },
            },
            presenters: {
              create: {
                ...omit(
                  [ "photo" ],
                  info.talk.presenter,
                ),
              },
            },
          },
        }
        : undefined;

    const workshopInfo =
      info.workshop
        ? {
          create: {
            ...omit(
              [
                "presenter",
              ],
              info.workshop,
            ),
            presenters: {
              create: {
                ...omit(
                  [ "photo" ],
                  info.workshop.presenter,
                ),
              },
            },
          },
        }
        : undefined
    ;

    const entity = await ctx.prisma.$transaction(async (prisma) => {
      const oldApplication = await prisma.companyApplication.findUnique({
        where: {
          // eslint-disable-next-line camelcase
          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },
        select: {
          id: true,

          talk: {
            select: {
              id: true,
            },
          },

          workshop: {
            select: {
              id: true,
            },
          },
        },
      });

      console.log({ oldApplication });

      if (!oldApplication) {
        return await prisma.companyApplication.create({
          data: {
            booth: info.booth,
            wantsPanel: info.wantsPanel,
            wantsCocktail: info.wantsCocktail,
            talk: talkInfo,
            workshop: workshopInfo,
            forCompany: {
              connect: {
                vat: info.vat,
              },
            },
            forSeason: {
              connect: {
                id: currentSeason.id,
              },
            },
          },
        });
      }

      if (!info.talk && oldApplication.talk) {
        await prisma.applicationTalk.delete({
          where: {
            forApplicationId: oldApplication.id,
          },
        });
      } else if (info.talk) {
        await prisma.applicationTalk.upsert({
          where: {
            forApplicationId: oldApplication.id,
          },
          create: {
            ...talkInfo!.create,
          },
          update: {
            ...talkInfo!.create,
          },
        });
      }

      if (!info.workshop && oldApplication.workshop) {
        await prisma.applicationWorkshop.delete({
          where: {
            forApplicationId: oldApplication.id,
          },
        });
      } else if (info.workshop) {
        await prisma.applicationWorkshop.upsert({
          where: {
            forApplicationId: oldApplication.id,
          },
          create: {
            ...workshopInfo!.create,
          },
          update: {
            ...workshopInfo!.create,
          },
        });
      }

      return await ctx.prisma.companyApplication.update({
        where: {
          // eslint-disable-next-line camelcase
          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },
        data: {
          booth: info.booth,
          wantsPanel: info.wantsPanel,
          wantsCocktail: info.wantsCocktail,
        },
        include: {
          talk: true,
          workshop: true,
        },
      });
    });

    console.log({
      info,
      entity,
    });

    return {
      entity,
    };
  }

  @Mutation(() => Boolean, { nullable: true })
  createCompanyApplicationCocktailPreference(
    @Ctx() ctx: Context,
      @Arg("vat") vat: string,
      @Arg("info") info: boolean,
  ): MaybePromise<boolean | null> {
    console.log({
      info,
    });

    return null;
  }

  @Mutation(() => Boolean, { nullable: true })
  createCompanyApplicationPanelPreference(
    @Ctx() ctx: Context,
      @Arg("vat") vat: string,
      @Arg("info") info: boolean,
  ): MaybePromise<boolean | null> {
    console.log({
      info,
    });

    return null;
  }
}
