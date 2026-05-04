import {
  OtherContent,
  OtherContentPresenter,
  CalendarItem,
  Image,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Info,
  InputType,
  Field,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLUpload,
  FileUpload,
} from "graphql-upload";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  Role,
} from "../../helpers/auth";
import {
  Context,
} from "../../types/apollo-context";
import {
  transformSelect as transformSelectCalendarItem,
} from "./calendarItem";
import {
  transformSelect as transformSelectPhoto,
} from "./image";
import {
  ImageBase,
  ImageService,
} from "../../services/image-service";

@Resolver(() => OtherContentPresenter)
export class OtherContentPresenterFieldResolver {
  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() presenter: OtherContentPresenter,
  ): Image | null {
    return presenter.photo || null;
  }
}

@Resolver(() => OtherContent)
export class OtherContentFieldResolver {
  @FieldResolver(() => CalendarItem, { nullable: true })
  event(
    @Root() otherContent: OtherContent,
  ): GQLField<CalendarItem, "nullable"> {
    return otherContent.event || null;
  }

  @FieldResolver(() => [ OtherContentPresenter ])
  participants(
    @Root() otherContent: OtherContent,
  ): OtherContentPresenter[] {
    return otherContent.participants || [];
  }

  @FieldResolver(() => Number)
  async reservation(
    @Root() otherContent: OtherContent,
    @Ctx() ctx: Context,
  ): Promise<GQLField<number>> {
    const { user } = ctx;

    if (!user) {
      return 0;
    }

    const reservation = await ctx.prisma.eventReservation.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        eventId_eventType_userId: {
          eventType: otherContent.subtype,
          eventId: otherContent.id!,
          userId: user.id,
        },
      },
    });

    return reservation?.status ?? 0;
  }
}

export const transformSelect = transformSelectFor<OtherContentFieldResolver>({
  event(select) {
    select.event = {
      select: transformSelectCalendarItem(select.event as Dict),
    };
    return select;
  },
  participants(select) {
    const participantSelect = select.participants as Dict;
    select.participants = {
      select: transformSelectFor<OtherContentPresenterFieldResolver>({
        photo(ps) {
          ps.photo = {
            select: transformSelectPhoto(ps.photo as Dict),
          };
          return ps;
        },
      })(participantSelect),
    };
    return select;
  },
  reservation(select) {
    select.id = true;
    select.subtype = true;
    delete select.reservation;
    return select;
  },
});

const photoMimeTypes = new Set([
  "image/png",
  "image/jpeg",
]);

const photoExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
];

@InputType()
class OtherContentPresenterInput {
  @Field(() => String)
    firstName: string = "";

  @Field(() => String)
    lastName: string = "";

  @Field(() => String)
    bioEn: string = "";

  @Field(() => String)
    bioHr: string = "";

  @Field(() => GraphQLUpload, { nullable: true })
    photo: Promise<FileUpload> | null = null;

  @Field(() => String, { nullable: true })
    existingPhotoUid: string | null = null;
}

@InputType()
class OtherContentUpdateInput {
  @Field(() => String, { nullable: true })
    uid: string | null = null;

  @Field(() => String)
    nameHr: string = "";

  @Field(() => String)
    nameEn: string = "";

  @Field(() => String)
    descriptionHr: string = "";

  @Field(() => String)
    descriptionEn: string = "";

  @Field(() => String)
    subtype: string = "other";

  @Field(() => String)
    season: string = "";

  @Field(() => [ OtherContentPresenterInput ], { nullable: true })
    participants: OtherContentPresenterInput[] | null = null;
}

@Resolver(() => OtherContent)
export class OtherContentQueryResolver {
  @Query(() => [ OtherContent ])
  otherContents(
    @Ctx() ctx: Context,
      @Arg("season", () => String, { nullable: true }) season: string | undefined,
      @Info() gqlInfo: GraphQLResolveInfo,
  ) {
    const now = new Date();

    const seasonFilter =
      season
        ? {
          forSeason: {
            uid: season,
          },
        }
        : {
          forSeason: {
            startsAt: {
              lte: now,
            },
            endsAt: {
              gte: now,
            },
          },
        }
    ;

    return ctx.prisma.otherContent.findMany({
      where: seasonFilter,
      select: toSelect(gqlInfo, transformSelect),
    });
  }
}

@Resolver(() => OtherContent)
export class OtherContentUpdateResolver {
  @Authorized(Role.Admin)
  @Mutation(() => OtherContent, { nullable: true })
  updateOtherContent(
    @Ctx() ctx: Context,
      @Arg("input", () => OtherContentUpdateInput) input: OtherContentUpdateInput,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<OtherContent, "nullable"> {
    return ctx.prisma.$transaction(async (prisma) => {
      const season = await prisma.season.findFirst({
        where: {
          uid: input.season,
        },
        select: {
          id: true,
        },
      });

      if (!season) {
        throw new Error("Season not found");
      }

      const createData = {
        nameHr: input.nameHr,
        nameEn: input.nameEn,
        descriptionHr: input.descriptionHr,
        descriptionEn: input.descriptionEn,
        subtype: input.subtype,
        forSeasonId: season.id,
      };

      const result = await prisma.otherContent.upsert({
        create: createData,
        update: createData,
        where: {
          uid: input.uid || "",
        },
        select: {
          id: true,
          uid: true,
          ...toSelect(gqlInfo, transformSelect),
        },
      });

      if (input.participants && input.participants.length > 0) {
        const participantsData: {
          firstName: string;
          lastName: string;
          bioEn: string;
          bioHr: string;
          photoId?: number;
          forContentId: number;
        }[] = [];

        for (const presenter of input.participants) {
          const photoFile = presenter.photo ? await presenter.photo : null;

          let photoId: number | undefined;

          if (photoFile) {
            if (
              !photoMimeTypes.has(photoFile.mimetype)
              || !photoExtensions.some((ext) => photoFile.filename.toLowerCase().endsWith(ext))
            ) {
              throw new Error(`Presenter photo must have extension: ${ photoExtensions.join(", ") }`);
            }

            const photo = await ImageService.uploadImage(
              `other-content/${ result.uid }/presenters` as ImageBase,
              photoFile,
              ctx.user!,
              prisma,
            );

            if (!photo) {
              throw new Error("Something went wrong while uploading presenter photo");
            }

            photoId = photo.id;
          } else if (presenter.existingPhotoUid) {
            const existingPhoto = await prisma.image.findUnique({
              where: { uid: presenter.existingPhotoUid },
              select: { id: true },
            });
            if (existingPhoto) {
              photoId = existingPhoto.id;
            }
          }

          participantsData.push({
            firstName: presenter.firstName,
            lastName: presenter.lastName,
            bioEn: presenter.bioEn,
            bioHr: presenter.bioHr,
            ...(photoId !== undefined ? { photoId } : {}),
            forContentId: result.id,
          });
        }

        await prisma.otherContentPresenter.deleteMany({
          where: {
            forContentId: result.id,
          },
        });

        await prisma.otherContentPresenter.createMany({
          data: participantsData,
        });
      } else if (input.participants !== undefined) {
        await prisma.otherContentPresenter.deleteMany({
          where: {
            forContentId: result.id,
          },
        });
      }

      return prisma.otherContent.findUnique({
        where: {
          id: result.id,
        },
        select: toSelect(gqlInfo, transformSelect),
      });
    });
  }

  @Authorized(Role.Admin)
  @Mutation(() => Boolean)
  deleteOtherContent(
    @Ctx() ctx: Context,
      @Arg("uid", () => String) uid: string,
  ): GQLResponse<boolean> {
    return ctx.prisma.otherContent.delete({
      where: {
        uid,
      },
    }).then(() => true).catch(() => false);
  }
}
