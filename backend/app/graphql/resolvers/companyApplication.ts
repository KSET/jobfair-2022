import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Mutation,
  ObjectType,
  Query,
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
  GraphQLResolveInfo,
} from "graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  CompanyApplicationValidation,
} from "../../services/validation-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import SlackNotificationService from "../../services/slack-notification-service";
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
export class CompanyApplicationInfoResolver {
  @Query(() => CompanyApplication, { nullable: true })
  async companyApplication(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (1 > ctx.user.companies.length) {
      return null;
    }

    const [ company ] = ctx.user.companies;

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
      return null;
    }

    return ctx.prisma.companyApplication.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        forCompanyId_forSeasonId: {
          forCompanyId: company.id,
          forSeasonId: currentSeason.id,
        },
      },
      select: toSelect(info, transformSelect),
    });
  }
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
              presenters: {
                select: {
                  id: true,
                },
              },
            },
          },

          workshop: {
            select: {
              id: true,
              presenters: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (info.talk?.presenter) {
        info.talk.presenter.photo = undefined as unknown as null;
      }

      if (info.workshop?.presenter) {
        info.workshop.presenter.photo = undefined as unknown as null;
      }

      if (!oldApplication) {
        const entity = await prisma.companyApplication.create({
          data: {
            booth: info.booth,
            wantsPanel: info.wantsPanel,
            wantsCocktail: info.wantsCocktail,
            talk: {
              create:
                info.talk
                  ? {
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
                        ...info.talk.presenter,
                      },
                    },
                  }
                  : undefined
              ,
            },
            workshop: {
              create:
                info.workshop
                  ? {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.workshop,
                    ),
                    presenters: {
                      create: {
                        ...info.workshop.presenter,
                      },
                    },
                  }
                  : undefined
              ,
            },
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
          include: {
            workshop: true,
            talk: true,
          },
        });

        void SlackNotificationService.notifyOfNewApplication(
          company,
          ctx.user!,
          {
            booth: info.booth || ":x:",
            workshop: Boolean(info.workshop),
            talk: Boolean(info.talk),
            cocktail: info.wantsCocktail,
            panel: info.wantsPanel,
          },
        );

        return entity;
      }

      const deleteIf =
        (cond: unknown) =>
          cond
            ? {
              delete: true,
            }
            : undefined
      ;

      return await prisma.companyApplication.update({
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
          talk:
            info.talk
              ? {
                upsert: {
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
                        ...info.talk.presenter,
                      },
                    },
                  },
                  update: {
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
                      deleteMany: oldApplication.talk
                        ? {
                          id: {
                            in: oldApplication.talk?.presenters.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: info.talk.presenter,
                    },
                  },
                },
              }
              : deleteIf(oldApplication.talk),
          workshop:
            info.workshop
              ? {
                upsert: {
                  create: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.workshop,
                    ),
                    presenters: {
                      create: {
                        ...info.workshop.presenter,
                      },
                    },
                  },
                  update: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.workshop,
                    ),
                    presenters: {
                      deleteMany: oldApplication.workshop
                        ? {
                          id: {
                            in: oldApplication.workshop?.presenters.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: {
                        ...info.workshop.presenter,
                      },
                    },
                  },
                },
              }
              : deleteIf(oldApplication.workshop),
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

        include: {
          workshop: {
            include: {
              presenters: true,
            },
          },
          talk: {
            include: {
              presenters: true,
              category: true,
            },
          },
        },
      });
    });

    return {
      entity,
    };
  }
}
