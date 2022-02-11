import {
  Arg,
  Args,
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
  Company,
  FindManyCompanyApplicationArgs,
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
  FieldError,
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
  BoothsService,
} from "../../services/booths-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  ImageBase,
  ImageService,
} from "../../services/image-service";
import {
  TalkCreateInput,
  transformSelect as transformSelectTalks,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectWorkshops,
  WorkshopCreateInput,
} from "./companyApplicationWorkshop";
import {
  transformSelect as transformSelectCompany,
} from "./company";

const photoMimeTypes = new Set([
  "image/png",
  "image/jpeg",
]);

const photoExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
];

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

  @FieldResolver(() => Company, { nullable: true })
  forCompany(
    @Root() application: CompanyApplication,
  ): Company {
    return application.forCompany!;
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

  forCompany(select) {
    select.forCompany = {
      select: transformSelectCompany(select.forCompany as Record<string, unknown>),
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

  @Query(() => [ CompanyApplication ], { nullable: true })
  companyApplications(
  @Ctx() ctx: Context,
    @Args() args: FindManyCompanyApplicationArgs,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const now = new Date();

    return ctx.prisma.companyApplication.findMany({
      ...args,
      where: {
        forSeason: {
          startsAt: {
            lte: now,
          },
          endsAt: {
            gte: now,
          },
        },
        ...args.where,
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

    const booths = await BoothsService.fetchBooths();

    if (!booths.some((booth) => info.booth === booth.key)) {
      return {
        errors: [
          {
            field: "booth",
            message: "Unknown booth",
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
                  photo: {
                    select: {
                      id: true,
                    },
                  },
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
                  photo: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let talkPresenter;
      if (info.talk) {
        talkPresenter = {
          ...info.talk.presenter,
          photo: {
            connect: {
              id: 0,
            },
          },
        };

        const photoFile = await info.talk.presenter.photo;

        if (photoFile) {
          if (
            !photoMimeTypes.has(photoFile?.mimetype) ||
            !photoExtensions.some((ext) => photoFile.filename.endsWith(ext))
          ) {
            return {
              errors: [
                {
                  field: "talk.presenter.photo",
                  message: `File must have extension: ${ photoExtensions.join(", ") }`,
                },
              ],
            };
          }

          const photo = await ImageService.uploadImage(
            `company/${ info.vat }/talk/presenters` as ImageBase,
            photoFile,
            ctx.user!,
          );

          if (!photo) {
            return {
              errors: [
                {
                  field: "talk.presenter.photo",
                  message: "Something went wrong",
                },
              ],
            };
          }

          talkPresenter.photo.connect.id = photo.id;
        } else if (oldApplication?.talk?.presenters[0].photo) {
          talkPresenter.photo.connect.id = oldApplication.talk.presenters[0].photo.id;
        } else {
          return {
            errors: [
              {
                field: "talk.presenter.photo",
                message: "Photo is required",
              },
            ],
          };
        }
      }

      let workshopPresenter;
      if (info.workshop) {
        workshopPresenter = {
          ...info.workshop.presenter,
          photo: {
            connect: {
              id: 0,
            },
          },
        };

        const photoFile = await info.workshop.presenter.photo;

        if (photoFile) {
          if (
            !photoMimeTypes.has(photoFile?.mimetype) ||
            !photoExtensions.some((ext) => photoFile.filename.endsWith(ext))
          ) {
            return {
              errors: [
                {
                  field: "workshop.presenter.photo",
                  message: `File must have extension: ${ photoExtensions.join(", ") }`,
                },
              ],
            };
          }

          const photo = await ImageService.uploadImage(
            `company/${ info.vat }/workshop/presenters` as ImageBase,
            photoFile,
            ctx.user!,
          );

          if (!photo) {
            return {
              errors: [
                {
                  field: "workshop.presenter.photo",
                  message: "Something went wrong",
                },
              ],
            };
          }

          workshopPresenter.photo.connect.id = photo.id;
        } else if (oldApplication?.workshop?.presenters[0].photo) {
          workshopPresenter.photo.connect.id = oldApplication.workshop.presenters[0].photo.id;
        } else {
          return {
            errors: [
              {
                field: "workshop.presenter.photo",
                message: "Photo is required",
              },
            ],
          };
        }
      }

      const chosen = {
        booth: booths.find((booth) => booth.key === info.booth)?.name,
        workshop: Boolean(info.workshop),
        talk: Boolean(info.talk),
        cocktail: info.wantsCocktail,
        panel: info.wantsPanel,
      } as const;

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
                        ...talkPresenter as NonNullable<typeof talkPresenter>,
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
                        ...workshopPresenter as NonNullable<typeof workshopPresenter>,
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
            workshop: {
              include: {
                presenters: {
                  include: {
                    photo: true,
                  },
                },
              },
            },
            talk: {
              include: {
                presenters: {
                  include: {
                    photo: true,
                  },
                },
                category: true,
              },
            },
          },
        });

        if (entity) {
          void SlackNotificationService.notifyOfNewApplication(
            company,
            ctx.user!,
            chosen,
          );

          void EventsService.logEvent(
            "company-application:create",
            ctx.user!.id,
            {
              vat: company.vat,
              chosen,
            },
          );
        }

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

      const entity = await prisma.companyApplication.update({
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
                        ...talkPresenter as NonNullable<typeof talkPresenter>,
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
                      create: {
                        ...talkPresenter as NonNullable<typeof talkPresenter>,
                      },
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
                        ...workshopPresenter as NonNullable<typeof workshopPresenter>,
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
                        ...workshopPresenter as NonNullable<typeof workshopPresenter>,
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
              presenters: {
                include: {
                  photo: true,
                },
              },
            },
          },
          talk: {
            include: {
              presenters: {
                include: {
                  photo: true,
                },
              },
              category: true,
            },
          },
        },
      });

      if (entity) {
        void EventsService.logEvent(
          "company-application:update",
          ctx.user!.id,
          {
            vat: company.vat,
            chosen,
          },
        );
      }

      return entity;
    }).catch((err) => {
      console.log(err);

      return {
        errors: [
          {
            field: "entity",
            message: "Something went wrong",
          },
        ],
      };
    });

    const errors = (entity as Record<string, unknown>).errors as FieldError[] | undefined;

    if (errors) {
      return {
        errors,
      };
    }

    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      entity,
    };
  }
}
