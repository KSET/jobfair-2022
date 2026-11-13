/* eslint-disable camelcase */
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
import {
  ApplicationPresenter,
  ApplicationTalk,
  ApplicationWorkshop,
  ApplicationFusion,
  Company,
  CompanyApplication,
  CompanyApplicationApproval,
  CompanyApplicationContactPerson,
  CompanyApplicationContactPersonCreateInput,
  FindManyCompanyApplicationArgs,
  Season,
  CompanyApplicationFeedback,
  ApplicationCocktail,
  ApplicationQuest,
  ApplicationInternship,
} from "@generated/type-graphql";
import {
  groupBy,
  mapObject,
  omit,
} from "rambdax";
import {
  GraphQLResolveInfo,
} from "graphql";
import type {
  Prisma,
  User,
} from "@prisma/client";
import {
  upperFirst,
} from "lodash";
import {
  FileUpload,
} from "graphql-upload";
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
  oldEventPresentersSelect,
  oldPresentersSelect,
  presenterOrderBy,
} from "../../helpers/presenter";
import {
  CompanyApplicationApprovedValidation,
  CompanyApplicationValidation,
} from "../../services/validation-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  NotificationService,
} from "../../services/notification-service";
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
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  captureError,
} from "../../services/error-service";
import {
  TalksCreateInput,
  transformSelect as transformSelectTalks,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectWorkshops,
  WorkshopsCreateInput,
} from "./companyApplicationWorkshop";
import {
  FusionsCreateInput,
  transformSelect as transformSelectFusions,
} from "./companyApplicationFusion";
import {
  transformSelect as transformSelectCompany,
} from "./company";
import {
  transformSelect as transformSelectSeason,
} from "./season";
import {
  transformSelect as transformSelectApproval,
} from "./companyApplicationApproval";
import {
  CocktailChooseInput,
  transformSelect as transformSelectCocktail,
} from "./companyApplicationCocktail";
import {
  transformSelect as transformSelectQuest,
} from "./companyApplicationQuest";
import {
  transformSelect as transformSelectInternship
} from "./companyApplicationInternship"
import {
  PresenterCreateInput,
  transformSelect as transformSelectPresenter,
} from "./companyPresenter";
import type {
  ImageCropInput,
} from "./image";
import {
  transformSelect as transformSelectFeedback,
} from "./companyApplicationFeedback";
import {
  transformSelect as transformSelectContactPerson,
} from "./companyApplicationContactPerson";

const photoMimeTypes = new Set([
  "image/png",
  "image/jpeg",
]);

const photoExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
];

class PresenterCreateError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

type OldPresenter = {
  photo: { id: number, uid: string, } | null,
};

type PresenterData = {
  firstName: string,
  lastName: string,
  bioEn: string,
  bioHr: string,
  order: number,
};

type PresenterPlan = {
  field: string,
  data: PresenterData,
  photo: { file: FileUpload, crop: ImageCropInput | null, } | { id: number, },
};

type PresenterCreate = PresenterData & {
  photo: { connect: { id: number, }, },
};

/** The most presenters a save may send for an event: as many forms as the pages render. */
const maxPresentersFor =
  (approvedCount: number | null | undefined, oldPresenters: OldPresenter[]) =>
    Math.max(1, approvedCount ?? 0, oldPresenters.length)
;

const plural = (count: number, word: string) => `${ count } ${ word }${ 1 === count ? "" : "s" }`;

/**
 * Checks an event's presenters without uploading anything, keeping list order in `order`.
 * A presenter without a new upload keeps its photo through `existingPhotoUid`,
 * which only resolves to photos of the event's previous presenters.
 * Throws `PresenterCreateError` (field `entity` or `${ fieldBase }.${ index }.photo`).
 */
const planPresenters =
  async (
    {
      label,
      fieldBase,
      presenters,
      oldPresenters,
      minPresenters = 1,
      maxPresenters,
    }: {
      label: string,
      fieldBase: string,
      presenters: PresenterCreateInput[],
      oldPresenters: OldPresenter[],
      minPresenters?: number,
      maxPresenters: number,
    },
  ) => {
    if (presenters.length < minPresenters) {
      throw new PresenterCreateError("entity", `At least ${ plural(minPresenters, `${ label } presenter`) } required`);
    }

    if (presenters.length > maxPresenters) {
      throw new PresenterCreateError("entity", `At most ${ plural(maxPresenters, `${ label } presenter`) } allowed`);
    }

    const plans: PresenterPlan[] = [];
    /** Old photos already kept by an earlier presenter, so two presenters can't share one. */
    const claimedPhotoIds = new Set<number>();

    for (const [ i, presenter ] of presenters.entries()) {
      const field = `${ fieldBase }.${ i }.photo`;
      const file = await presenter.photo;
      const data = {
        firstName: presenter.firstName,
        lastName: presenter.lastName,
        bioEn: presenter.bioEn,
        bioHr: presenter.bioHr,
        order: i,
      };

      if (file) {
        if (
          !photoMimeTypes.has(file.mimetype)
          || !photoExtensions.some((ext) => file.filename.toLowerCase().endsWith(ext))
        ) {
          throw new PresenterCreateError(field, `File must have extension: ${ photoExtensions.join(", ") }`);
        }

        plans.push({
          field,
          data,
          photo: {
            file,
            crop: presenter.photoCrop,
          },
        });
        continue;
      }

      const oldPhoto =
        presenter.existingPhotoUid
          ? oldPresenters.find((p) => p.photo?.uid === presenter.existingPhotoUid)?.photo
          : null
      ;

      if (!oldPhoto || claimedPhotoIds.has(oldPhoto.id)) {
        throw new PresenterCreateError(field, "Photo is required");
      }

      claimedPhotoIds.add(oldPhoto.id);

      plans.push({
        field,
        data,
        photo: {
          id: oldPhoto.id,
        },
      });
    }

    return plans;
  }
;

/** Removes photos uploaded for a save that did not go through. */
const deleteUploadedPhotos =
  async (uids: string[], user: User) => {
    await Promise.all(
      uids.map((uid) =>
        ImageService
          .deleteImage(uid, user)
          .catch((e) => {
            captureError(e);
            return false;
          }),
      ),
    );
  }
;

/**
 * Uploads the new photos of all planned events one at a time and returns the presenters' create data.
 * If any upload fails, the photos already uploaded are deleted and a `PresenterCreateError` is thrown.
 * `uploadedUids` lets the caller delete the photos when its own write fails.
 */
const createPresenters =
  async <TPlans extends Partial<Record<string, PresenterPlan[]>>>(
    plans: TPlans,
    {
      vat,
      user,
    }: {
      vat: string,
      user: User,
    },
  ) => {
    const uploadedUids: string[] = [];
    const create: Partial<Record<string, PresenterCreate[]>> = {};

    for (const [ eventType, eventPlans ] of Object.entries(plans)) {
      const presentersCreate: PresenterCreate[] = [];

      for (const plan of eventPlans ?? []) {
        if ("id" in plan.photo) {
          presentersCreate.push({
            ...plan.data,
            photo: {
              connect: {
                id: plan.photo.id,
              },
            },
          });
          continue;
        }

        const image = await ImageService.uploadImage(
          `company/${ vat }/${ eventType }/presenters` as ImageBase,
          plan.photo.file,
          user,
          undefined,
          { crop: plan.photo.crop },
        ).catch((e: unknown) => {
          captureError(e);
          return null;
        });

        if (!image) {
          await deleteUploadedPhotos(uploadedUids, user);
          throw new PresenterCreateError(plan.field, "Something went wrong");
        }

        uploadedUids.push(image.uid);

        presentersCreate.push({
          ...plan.data,
          photo: {
            connect: {
              id: image.id,
            },
          },
        });
      }

      create[eventType] = presentersCreate;
    }

    return {
      create: create as { [K in keyof TPlans]: PresenterCreate[] },
      uploadedUids,
    };
  }
;

type ApplicationEvent = "talk" | "workshop" | "fusion";

type OldApplicationPresenters =
  Partial<Record<ApplicationEvent, { presenters: OldPresenter[], } | null>>
  & {
    approval?: Partial<Record<`${ ApplicationEvent }Participants`, number>> | null,
  }
;

/** Validates every picked event's presenters, then uploads their photos. Events not picked get no presenters. */
const toApplicationPresentersCreate =
  async (
    info: CompanyApplicationCreateInput,
    oldApplication: OldApplicationPresenters | null,
    user: User,
  ) => {
    const plans: Record<ApplicationEvent, PresenterPlan[]> = {
      talk: [],
      workshop: [],
      fusion: [],
    };

    for (const eventType of [ "talk", "workshop", "fusion" ] as const) {
      const event = info[eventType];

      if (!event) {
        continue;
      }

      const oldPresenters = oldApplication?.[eventType]?.presenters ?? [];

      plans[eventType] = await planPresenters({
        label: eventType,
        fieldBase: `${ eventType }.presenter`,
        presenters: event.presenter,
        oldPresenters,
        maxPresenters: maxPresentersFor(oldApplication?.approval?.[`${ eventType }Participants`], oldPresenters),
      });
    }

    return createPresenters(plans, { vat: info.vat, user });
  }
;

/** What `toApplicationPresentersCreate` needs of the application a save replaces. */
const oldApplicationPresentersSelect = {
  approval: {
    select: {
      talkParticipants: true,
      workshopParticipants: true,
      fusionParticipants: true,
    },
  },
  talk: oldEventPresentersSelect,
  workshop: oldEventPresentersSelect,
  fusion: oldEventPresentersSelect,
} as const;

@ObjectType()
export class EventUserApplications {
  @Field(() => Int)
    workshop?: number;

  @Field(() => Int)
    talk?: number;

  @Field(() => Int)
    fusion?: number;
}

@Resolver(() => CompanyApplication)
export class CompanyApplicationFieldResolver {
  @FieldResolver(() => CompanyApplicationContactPerson, { nullable: true })
  contactPerson(
    @Root() application: CompanyApplication,
  ): CompanyApplicationContactPerson | null {
    return application.contactPerson || null;
  }

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

  @FieldResolver(() => ApplicationFusion, { nullable: true })
  fusion(
    @Root() application: CompanyApplication,
  ): ApplicationFusion | null {
    return application.fusion || null;
  }

  @FieldResolver(() => Company, { nullable: true })
  forCompany(
    @Root() application: CompanyApplication,
  ): Company {
    return application.forCompany!;
  }

  @FieldResolver(() => Season, { nullable: true })
  forSeason(
    @Root() application: CompanyApplication,
  ): Season {
    return application.forSeason!;
  }

  @FieldResolver(() => CompanyApplicationApproval, { nullable: true })
  approval(
    @Root() application: CompanyApplication,
  ): CompanyApplicationApproval | null {
    return application.approval || null;
  }

  @FieldResolver(() => ApplicationCocktail, { nullable: true })
  cocktail(
    @Root() application: CompanyApplication,
  ): ApplicationCocktail | null {
    return application.cocktail || null;
  }

  @FieldResolver(() => ApplicationQuest, { nullable: true })
  quest(
    @Root() application: CompanyApplication,
  ): ApplicationQuest | null {
    return application.quest || null;
  }

  @FieldResolver(() => [ ApplicationInternship ])
  internships(
    @Root() application: CompanyApplication,
  ): ApplicationInternship[] {
    return application.internships ?? [];
  }

  @FieldResolver(() => [ ApplicationPresenter ])
  panelParticipants(
    @Root() application: CompanyApplication,
  ): ApplicationPresenter[] {
    return application.panelParticipants || [];
  }

  @FieldResolver(() => EventUserApplications)
  async userApplications(
    @Root() application: CompanyApplication,
      @Ctx() ctx: Context,
  ): Promise<GQLField<EventUserApplications>> {
    const entries = await Promise.all([
      ctx.prisma.applicationWorkshop.findFirst({
        where: {
          forApplicationId: application.id,
        },
        select: {
          id: true,
        },
      }),
      ctx.prisma.applicationTalk.findFirst({
        where: {
          forApplicationId: application.id,
        },
        select: {
          id: true,
        },
      }),
      ctx.prisma.applicationFusion.findFirst({
        where: {
          forApplicationId: application.id,
        },
        select: {
          id: true,
        },
      }),
    ] as const);

    const ids = entries.map((x) => Number(x?.id || -1));

    type Row = { eventId: number, eventType: string, status: number, count: bigint, };
    const items = await ctx.prisma.$queryRaw<Row[]>`
      select
        "eventId", "eventType", "status", count("status")
      from
        "EventReservation"
      where
        "status" <> 0 and "eventId" = ANY(${ ids })
      group by
        "eventId", "eventType", "status"
    `;

    const byType = groupBy((x) => x.eventType, items);
    const summed = mapObject((rows: Row[]) => Number(rows.reduce((acc, row) => acc + row.count, 0n)), byType);

    return {
      workshop: summed.workshop ?? 0,
      talk: summed.talk ?? 0,
      fusion: summed.fusion ?? 0,
    };
  }

  @FieldResolver(() => CompanyApplicationFeedback, { nullable: true })
  feedback(
    @Root() application: CompanyApplication,
  ): GQLField<CompanyApplicationFeedback, "nullable"> {
    return application.feedback;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationFieldResolver>({
  contactPerson(select) {
    select.contactPerson = {
      select: transformSelectContactPerson(select.contactPerson as Record<string, unknown>),
    };

    return select;
  },

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

  fusion(select) {
    select.fusion = {
      select: transformSelectFusions(select.fusion as Record<string, unknown>),
    };

    return select;
  },

  forCompany(select) {
    select.forCompany = {
      select: transformSelectCompany(select.forCompany as Record<string, unknown>),
    };

    return select;
  },

  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Record<string, unknown>),
    };

    return select;
  },

  approval(select) {
    select.approval = {
      select: transformSelectApproval(select.approval as Dict),
    };

    return select;
  },

  cocktail(select) {
    select.cocktail = {
      select: transformSelectCocktail(select.cocktail as Dict),
    };

    return select;
  },

  quest(select) {
    select.quest = {
      select: transformSelectQuest(select.quest as Dict),
    };
    return select;
  },

  internships(select) {
    select.internships = {
      select: transformSelectInternship(select.internships as Dict),
    };

    return select;
  },

  panelParticipants(select) {
    select.panelParticipants = {
      select: transformSelectPresenter(select.panelParticipants as Dict),
      orderBy: presenterOrderBy,
    };

    return select;
  },

  userApplications(select) {
    select.id = true;

    delete select.userApplications;

    return select;
  },

  feedback(select) {
    select.feedback = {
      select: transformSelectFeedback(select.feedback as Dict),
    };

    return select;
  },
});

@InputType()
class CompanySignatoryCreateInput {
  @Field()
    fullName: string = "";

  @Field()
    function: string = "";
}

@InputType()
class QuestChooseInput {
  @Field()
    prize: string = "";
}

@InputType()
class CompanyApplicationCreateInput {
  @Field()
    vat: string = "";

  @Field(() => [CompanySignatoryCreateInput])
    signatories: CompanySignatoryCreateInput[] = [];

  @Field(() => CompanyApplicationContactPersonCreateInput)
    contactPerson: CompanyApplicationContactPersonCreateInput = null as never;

  @Field(() => String, { nullable: true })
    booth: string | null = null;

  @Field(() => TalksCreateInput, { nullable: true })
    talk: TalksCreateInput | null = null;

  @Field(() => WorkshopsCreateInput, { nullable: true })
    workshop: WorkshopsCreateInput | null = null;

  @Field(() => FusionsCreateInput, { nullable: true })
    fusion: FusionsCreateInput | null = null;

  @Field(() => QuestChooseInput, { nullable: true })
    quest: QuestChooseInput | null = null;

  @Field(() => Boolean)
    wantsCocktail: boolean = false;

  @Field(() => Boolean)
    wantsPanel: boolean = false;

  @Field(() => Boolean)
    wantsQuest: boolean = false;
}

@InputType()
class CompanyApplicationApprovedEditInput {
  @Field()
    vat: string = "";

  @Field(() => TalksCreateInput, { nullable: true })
    talk: TalksCreateInput | null = null;

  @Field(() => WorkshopsCreateInput, { nullable: true })
    workshop: WorkshopsCreateInput | null = null;

  @Field(() => FusionsCreateInput, { nullable: true })
    fusion: FusionsCreateInput | null = null;

  @Field(() => CocktailChooseInput, { nullable: true })
    cocktail: CocktailChooseInput | null = null;

  @Field(() => QuestChooseInput, { nullable: true })
    quest: QuestChooseInput | null = null;

  @Field(() => [ PresenterCreateInput ])
    panel: PresenterCreateInput[] = [];
}

@ObjectType()
class CreateCompanyApplicationResponse extends ValidationResponseFor(CompanyApplication) {
}

@ObjectType()
class EditApprovedCompanyApplicationResponse extends ValidationResponseFor(CompanyApplication) {
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
export class CompanyApplicationAdminResolver {
  @Query(() => [ CompanyApplication ], { nullable: true })
  companyApplications(
  @Ctx() ctx: Context,
    @Arg("season", { nullable: true }) seasonUid: string,
    @Args() args: FindManyCompanyApplicationArgs,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const now = new Date();

    return ctx.prisma.companyApplication.findMany({
      ...args,
      cursor: undefined,
      where: {
        forSeason:
          seasonUid
            ? {
              uid: seasonUid,
            }
            : {
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

  @Query(() => CompanyApplication, { nullable: true })
  companyApplicationFor(
  @Ctx() ctx: Context,
    @Arg("company") companyUid: string,
    @Arg("season") seasonUid: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.companyApplication.findFirst({
      where: {
        forSeason: {
          uid: seasonUid,
        },
        forCompany: {
          uid: companyUid,
        },
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Mutation(() => Boolean)
  async deleteCompanyApplicationFor(
    @Ctx() ctx: Context,
    @Arg("season") seasonUid: string,
    @Arg("company") companyUid: string,
  ): GQLResponse<boolean> {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return false;
    }

    await ctx.prisma.companyApplication.deleteMany({
      where: {
        forSeason: {
          uid: seasonUid,
        },
        forCompany: {
          uid: companyUid,
        },
      },
    });

    return true;
  }

  @Mutation(() => CreateCompanyApplicationResponse, { nullable: true })
  async createCompanyApplicationFor(
    @Ctx() ctx: Context,
      @Arg("season") seasonUid: string,
      @Arg("company") companyUid: string,
      @Arg("info") info: CompanyApplicationCreateInput,
  ): Promise<CreateCompanyApplicationResponse | null> {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    const validation = await CompanyApplicationValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
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

    const company = await ctx.prisma.company.findUnique({
      where: {
        uid: companyUid,
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
        uid: seasonUid,
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

    // Validate and upload presenter photos before the transaction, so slow uploads can't time it out
    let presentersCreate: Awaited<ReturnType<typeof toApplicationPresentersCreate>>;
    try {
      presentersCreate = await toApplicationPresentersCreate(
        info,
        await ctx.prisma.companyApplication.findUnique({
          where: {
            forCompanyId_forSeasonId: {
              forCompanyId: company.id,
              forSeasonId: currentSeason.id,
            },
          },
          select: oldApplicationPresentersSelect,
        }),
        ctx.user,
      );
    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }

    // `uploadedUids` are deleted again if the transaction fails
    const { create: presenters, uploadedUids } = presentersCreate;
    const entity = await ctx.prisma.$transaction(async (prisma) => {
      const oldApplication = await prisma.companyApplication.findUnique({
        where: {

          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },
        select: {
          id: true,

          talk: oldEventPresentersSelect,
          workshop: oldEventPresentersSelect,
          fusion: oldEventPresentersSelect,

          quest: {
            select: {
              id: true,
            },
          },
        },
      });

      const chosen = {
        booth: booths.find((booth) => booth.key === info.booth)?.name,
        workshop: Boolean(info.workshop),
        talk: Boolean(info.talk),
        fusion: Boolean(info.fusion),
        cocktail: info.wantsCocktail,
        panel: info.wantsPanel,
        quest: info.wantsQuest,
      } as const;

      // Update company signatories
      await prisma.companySignatory.deleteMany({
        where: {
          forCompanyId: company.id,
        },
      });

      await prisma.companySignatory.createMany({
        data: info.signatories.map((sig) => ({
          ...sig,
          forCompanyId: company.id,
        })),
      });

      if (!oldApplication) {
        const entity = await prisma.companyApplication.create({
          data: {
            contactPerson: {
              create: info.contactPerson,
            },
            booth: info.booth,
            wantsPanel: info.wantsPanel,
            wantsCocktail: info.wantsCocktail,
            wantsQuest: info.wantsQuest,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.talk,
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
                      create: presenters.workshop,
                    },
                  }
                  : undefined
              ,
            },
            fusion: {
              create:
                info.fusion
                  ? {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.fusion,
                    },
                  }
                  : undefined
              ,
            },
            quest: {
              create:
                info.wantsQuest && info.quest
                  ? {
                    prize: info.quest.prize,
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
                  orderBy: presenterOrderBy,
                  include: {
                    photo: true,
                  },
                },
              },
            },
            talk: {
              include: {
                presenters: {
                  orderBy: presenterOrderBy,
                  include: {
                    photo: true,
                  },
                },
                category: true,
              },
            },
            fusion: {
              include: {
                presenters: {
                  orderBy: presenterOrderBy,
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
            "admin:company-application:create",
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

          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },

        data: {
          contactPerson: {
            update: info.contactPerson,
          },
          booth: info.booth,
          wantsPanel: info.wantsPanel,
          wantsCocktail: info.wantsCocktail,
          wantsQuest: info.wantsQuest,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.talk,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      deleteMany: oldApplication.talk
                        ? {
                          id: {
                            in: oldApplication.talk?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.talk,
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
                      create: presenters.workshop,
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
                            in: oldApplication.workshop?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.workshop,
                    },
                  },
                },
              }
              : deleteIf(oldApplication.workshop),
          fusion:
            info.fusion
              ? {
                upsert: {
                  create: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.fusion,
                    },
                  },
                  update: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      deleteMany: oldApplication.fusion
                        ? {
                          id: {
                            in: oldApplication.fusion?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.fusion,
                    },
                  },
                },
              }
              : deleteIf(oldApplication.fusion),
          quest:
            info.wantsQuest && info.quest
              ? {
                upsert: {
                  create: {
                    prize: info.quest.prize,
                  },
                  update: {
                    prize: info.quest.prize,
                  },
                },
              }
              : deleteIf(oldApplication.quest),
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
                orderBy: presenterOrderBy,
                include: {
                  photo: true,
                },
              },
            },
          },
          talk: {
            include: {
              presenters: {
                orderBy: presenterOrderBy,
                include: {
                  photo: true,
                },
              },
              category: true,
            },
          },
          fusion: {
            include: {
              presenters: {
                orderBy: presenterOrderBy,
                include: {
                  photo: true,
                },
              },
            },
          },
        },
      });

      if (entity) {
        void EventsService.logEvent(
          "admin:company-application:update",
          ctx.user!.id,
          // @ts-ignore
          {
            vat: company.vat,
            chosen,
          },
        );
      }

      return entity;
    }).catch(async (err) => {
      captureError(err);
      await deleteUploadedPhotos(uploadedUids, ctx.user!);

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

      // @ts-ignore
      entity,
    };
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

    // Validate signatories count (1-5 required)
    if (!info.signatories || info.signatories.length < 1) {
      return {
        errors: [
          {
            field: "signatories",
            message: "At least 1 signatory required",
          },
        ],
      };
    }

    if (info.signatories.length > 5) {
      return {
        errors: [
          {
            field: "signatories",
            message: "Maximum 5 signatories allowed",
          },
        ],
      };
    }

    const fields = omit([ "vat", "contactPerson", "signatories" ], info);
    const hasSomethingSelected = Object.values(fields).some(Boolean);

    if (!hasSomethingSelected) {
      return {
        errors: [
          {
            field: "entity",
            message: "You must select at least one option (eg. booth, talk, workshop, fusion)",
          },
        ],
      };
    }

    const canPickPanelOrCocktail = Boolean(info.talk || info.workshop || info.fusion || info.booth);

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
        uid: true,
        applicationsFrom: true,
        applicationsUntil: true,
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

    {
      const now = new Date();
      const from = new Date(currentSeason.applicationsFrom);
      const until = new Date(currentSeason.applicationsUntil);
      const applicationsOpen = from < now && now < until;

      if (!applicationsOpen) {
        return {
          errors: [
            {
              field: "entity",
              message: "Applications closed",
            },
          ],
        };
      }
    }

    // Validate and upload presenter photos before the transaction, so slow uploads can't time it out
    let presentersCreate: Awaited<ReturnType<typeof toApplicationPresentersCreate>>;
    try {
      presentersCreate = await toApplicationPresentersCreate(
        info,
        await ctx.prisma.companyApplication.findUnique({
          where: {
            forCompanyId_forSeasonId: {
              forCompanyId: company.id,
              forSeasonId: currentSeason.id,
            },
          },
          select: oldApplicationPresentersSelect,
        }),
        ctx.user,
      );
    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }

    // `uploadedUids` are deleted again if the transaction fails
    const { create: presenters, uploadedUids } = presentersCreate;
    const entity = await ctx.prisma.$transaction(async (prisma) => {
      const oldApplication = await prisma.companyApplication.findUnique({
        where: {
          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },
        select: {
          id: true,

          talk: oldEventPresentersSelect,
          workshop: oldEventPresentersSelect,
          fusion: oldEventPresentersSelect,

          quest: {
            select: {
              id: true,
            },
          },
        },
      });

      const chosen = {
        booth: booths.find((booth) => booth.key === info.booth)?.name,
        workshop: Boolean(info.workshop),
        talk: Boolean(info.talk),
        fusion: Boolean(info.fusion),
        cocktail: info.wantsCocktail,
        panel: info.wantsPanel,
        quest: info.wantsQuest,
      } as const;

      // Update company signatories
      await prisma.companySignatory.deleteMany({
        where: {
          forCompanyId: company.id,
        },
      });

      await prisma.companySignatory.createMany({
        data: info.signatories.map((sig) => ({
          ...sig,
          forCompanyId: company.id,
        })),
      });

      if (!oldApplication) {
        const entity = await prisma.companyApplication.create({
          data: {
            contactPerson: {
              create: info.contactPerson,
            },
            booth: info.booth,
            wantsPanel: info.wantsPanel,
            wantsCocktail: info.wantsCocktail,
            wantsQuest: info.wantsQuest,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.talk,
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
                      create: presenters.workshop,
                    },
                  }
                  : undefined
              ,
            },
            fusion: {
              create:
                info.fusion
                  ? {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.fusion,
                    },
                  }
                  : undefined
              ,
            },
            quest: {
              create:
                info.wantsQuest && info.quest
                  ? {
                    prize: info.quest.prize,
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
                  orderBy: presenterOrderBy,
                  include: {
                    photo: true,
                  },
                },
              },
            },
            talk: {
              include: {
                presenters: {
                  orderBy: presenterOrderBy,
                  include: {
                    photo: true,
                  },
                },
                category: true,
              },
            },
            fusion: {
              include: {
                presenters: {
                  orderBy: presenterOrderBy,
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
          void NotificationService.notify(
            "new application",
            {
              company,
              season: currentSeason,
              creator: ctx.user!,
              contactPerson: info.contactPerson,
              chosen: {
                ...chosen,
                talk: entity.talk,
                workshop: entity.workshop,
                fusion: entity.fusion,
              } as any,
            },
          );

          void EventsService.logEvent(
            "company-application:create",
            ctx.user!.id,
            // @ts-ignore
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

          forCompanyId_forSeasonId: {
            forCompanyId: company.id,
            forSeasonId: currentSeason.id,
          },
        },

        data: {
          contactPerson: {
            update: info.contactPerson,
          },
          booth: info.booth,
          wantsPanel: info.wantsPanel,
          wantsCocktail: info.wantsCocktail,
          wantsQuest: info.wantsQuest,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.talk,
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
                        forSeasonId_name: {
                          name: info.talk.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      deleteMany: oldApplication.talk
                        ? {
                          id: {
                            in: oldApplication.talk?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.talk,
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
                      create: presenters.workshop,
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
                            in: oldApplication.workshop?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.workshop,
                    },
                  },
                },
              }
              : deleteIf(oldApplication.workshop),
          fusion:
            info.fusion
              ? {
                upsert: {
                  create: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      create: presenters.fusion,
                    },
                  },
                  update: {
                    ...omit(
                      [
                        "presenter",
                      ],
                      info.fusion,
                    ),
                    category: {
                      connect: {
                        forSeasonId_name: {
                          name: info.fusion.category,
                          forSeasonId: currentSeason.id,
                        },
                      },
                    },
                    presenters: {
                      deleteMany: oldApplication.fusion
                        ? {
                          id: {
                            in: oldApplication.fusion?.presenters?.map((x) => x.id),
                          },
                        }
                        : undefined,
                      create: presenters.fusion,
                    },
                  },
                },
              }
              : deleteIf(oldApplication.fusion),
          quest:
            info.wantsQuest && info.quest
              ? {
                upsert: {
                  create: {
                    prize: info.quest.prize,
                  },
                  update: {
                    prize: info.quest.prize,
                  },
                },
              }
              : deleteIf(oldApplication.quest),
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
                orderBy: presenterOrderBy,
                include: {
                  photo: true,
                },
              },
            },
          },
          talk: {
            include: {
              presenters: {
                orderBy: presenterOrderBy,
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
    }, {
      maxWait: 10000,
      timeout: 20000,
    }).catch(async (err) => {
      captureError(err);
      await deleteUploadedPhotos(uploadedUids, ctx.user!);

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

      // @ts-ignore
      entity,
    };
  }

  @Mutation(() => EditApprovedCompanyApplicationResponse, { nullable: true })
  @Authorized()
  async editApprovedCompanyApplication(
    @Ctx() ctx: Context,
      @Arg("info") info: CompanyApplicationApprovedEditInput,
  ): Promise<EditApprovedCompanyApplicationResponse | null> {
    const user = ctx.user!;
    const validation = await CompanyApplicationApprovedValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    info.vat = info.vat.toUpperCase();

    const isInCompany = user.companies.some((company) => company.vat === info.vat);
    const isAdmin = hasAtLeastRole(Role.Admin, user);

    if (!isInCompany && !isAdmin) {
      return {
        errors: [
          {
            field: "entity",
            message: "You can not edit the company",
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
        applicationsFrom: true,
        applicationsUntil: true,
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

    const company = await ctx.prisma.company.findFirst({
      select: {
        id: true,
        applications: {
          select: {
            talk: oldEventPresentersSelect,
            workshop: oldEventPresentersSelect,
            fusion: oldEventPresentersSelect,

            panelParticipants: oldPresentersSelect,

            approval: true,
          },
          where: {
            forSeasonId: currentSeason.id,
          },
        },
      },
      where: {
        vat: info.vat,
        applications: {
          some: {
            forSeasonId: currentSeason.id,
          },
        },
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

    const [ application ] = company.applications;

    if (!application) {
      return {
        errors: [
          {
            field: "entity",
            message: "Applications closed",
          },
        ],
      };
    }

    const { approval } = application;

    if (!approval) {
      return {
        errors: [
          {
            field: "entity",
            message: "Applications closed",
          },
        ],
      };
    }

    const data: Prisma.CompanyApplicationUpdateArgs["data"] = {};

    const approvedEvents = [
      [ "talk", approval.talkParticipants ],
      [ "workshop", approval.workshopParticipants ],
      [ "fusion", approval.fusionParticipants ],
    ] as const;

    // Validate every event's presenters before anything is uploaded
    const presenterPlans: Partial<Record<ApplicationEvent | "panel", PresenterPlan[]>> = {};

    try {
      for (const [ id, minPresenters ] of approvedEvents) {
        if (0 >= minPresenters) {
          continue;
        }

        const entry = info[id];

        if (!entry) {
          return {
            errors: [
              {
                field: "entity",
                message: `${ upperFirst(id) } required`,
              },
            ],
          };
        }

        const oldPresenters = application[id]?.presenters ?? [];

        presenterPlans[id] = await planPresenters({
          label: id,
          fieldBase: `${ id }.presenter`,
          presenters: entry.presenter,
          oldPresenters,
          minPresenters,
          maxPresenters: maxPresentersFor(minPresenters, oldPresenters),
        });
      }

      if (approval.panel) {
        const id = "panel" as const;

        const entry = info[id];

        if (!entry) {
          return {
            errors: [
              {
                field: "entity",
                message: `${ upperFirst(id) } required`,
              },
            ],
          };
        }

        presenterPlans[id] = await planPresenters({
          label: id,
          fieldBase: id,
          presenters: entry,
          oldPresenters: application.panelParticipants,
          maxPresenters: maxPresentersFor(null, application.panelParticipants),
        });
      }
    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }

    if (approval.cocktail) {
      const id = "cocktail" as const;

      const entry = info[id];

      if (!entry) {
        return {
          errors: [
            {
              field: "entity",
              message: `${ upperFirst(id) } required`,
            },
          ],
        };
      }

      data[id] = {
        upsert: {
          create: {
            type: {
              connect: {
                forSeasonId_type: {
                  forSeasonId: currentSeason.id,
                  type: entry.type
                }
              }
            },
            name: entry.name
          },
          update: {
            type: {
              connect: {
                forSeasonId_type: {
                  forSeasonId: currentSeason.id,
                  type: entry.type
                }
              }
            },
            name: entry.name
          }
        }
      }
    }

    if (approval.quest) {
      const id = "quest" as const;

      const entry = info[id];

      if (!entry) {
        return {
          errors: [
            {
              field: "entity",
              message: `${ upperFirst(id) } required`,
            },
          ],
        };
      }

      data[id] = {
        upsert: {
          create: {
            prize: entry.prize,
          },
          update: {
            prize: entry.prize,
          },
        },
      };
    }

    let presenters: Awaited<ReturnType<typeof createPresenters<typeof presenterPlans>>>;

    try {
      presenters = await createPresenters(presenterPlans, { vat: info.vat, user });
    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }

    const replacePresenters =
      (oldPresenters: { id: number, }[] | undefined, create: PresenterCreate[]) => ({
        deleteMany: {
          id: {
            in: oldPresenters?.map((p) => p.id) ?? [],
          },
        },
        create,
      })
    ;

    const connectCategory =
      (name: string) => ({
        connect: {
          forSeasonId_name: {
            name,
            forSeasonId: currentSeason.id,
          },
        },
      })
    ;

    if (presenters.create.talk && info.talk) {
      data.talk = {
        update: {
          ...omit(
            [
              "presenter",
              "category",
            ],
            info.talk,
          ),
          category: connectCategory(info.talk.category),
          presenters: replacePresenters(application.talk?.presenters, presenters.create.talk),
        },
      };
    }

    if (presenters.create.workshop && info.workshop) {
      data.workshop = {
        update: {
          ...omit(
            [
              "presenter",
            ],
            info.workshop,
          ),
          presenters: replacePresenters(application.workshop?.presenters, presenters.create.workshop),
        },
      };
    }

    if (presenters.create.fusion && info.fusion) {
      data.fusion = {
        update: {
          ...omit(
            [
              "presenter",
              "category",
            ],
            info.fusion,
          ),
          category: connectCategory(info.fusion.category),
          presenters: replacePresenters(application.fusion?.presenters, presenters.create.fusion),
        },
      };
    }

    if (presenters.create.panel) {
      data.panelParticipants = replacePresenters(application.panelParticipants, presenters.create.panel);
    }

    const entity = await ctx.prisma.companyApplication.update({
      data,
      where: {
        id: approval.forApplicationId,
      },
      include: {
        workshop: {
          include: {
            presenters: {
              orderBy: presenterOrderBy,
              include: {
                photo: true,
              },
            },
          },
        },
        talk: {
          include: {
            presenters: {
              orderBy: presenterOrderBy,
              include: {
                photo: true,
              },
            },
            category: true,
          },
        },
        fusion: {
          include: {
            presenters: {
              orderBy: presenterOrderBy,
              include: {
                photo: true,
              },
            },
            category: true,
          },
        },
        panelParticipants: {
          orderBy: presenterOrderBy,
          include: {
            photo: true,
          },
        },
        cocktail: {
          include: {
            type: true
          }
        },
        quest: true,
        internships: true,
      },
    }).catch(async (e: unknown) => {
      await deleteUploadedPhotos(presenters.uploadedUids, user);
      throw e;
    });

    if (entity) {
      void EventsService.logEvent(
        "company-application:approved:update",
        ctx.user!.id,
        {
          vat: info.vat,
        },
      );
    }

    return {
      entity,
    };
  }
}
