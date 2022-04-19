import {
  Arg,
  Authorized,
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
  Int,
} from "type-graphql";
import {
  Sponsor,
  Image,
} from "@generated/type-graphql";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  ImageBase,
  ImageService,
} from "../../services/image-service";
import {
  swap,
} from "../../services/helpers/orderable";
import {
  transformSelect as transformSelectPhoto,
} from "./image";

@Resolver(() => Sponsor)
export class SponsorFieldResolver {
  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() sponsor: Sponsor,
  ): Image | null {
    return sponsor.photo || null;
  }
}

export const transformSelect = transformSelectFor<SponsorFieldResolver>({
  photo(select) {
    select.photo = {
      select: transformSelectPhoto(select.photo as Record<string, unknown>),
    };

    return select;
  },
});

@InputType()
export class SponsorCreateInput {
  @Field()
    name: string = "";

  @Field()
    url: string = "";

  @Field(() => GraphQLUpload)
    photo: FileUpload = null as unknown as FileUpload;
}

export class SponsorQueryResolver {
  @Query(() => [ Sponsor ])
  sponsors(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Arg("season", { nullable: true }) seasonUid: string,
  ) {
    const now = new Date();

    return ctx.prisma.sponsor.findMany({
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
      },
      select: toSelect(info, transformSelect),
      orderBy: {
        order: "asc",
      },
    });
  }
}

@ObjectType()
class CreateSponsorResponse extends ValidationResponseFor(Sponsor) {
}

export class AdminSponsorCreateResolver {
  @Mutation(() => CreateSponsorResponse)
  @Authorized(Role.Admin)
  async createSponsor(
    @Ctx() ctx: Context,
      @Arg("season") seasonUid: string,
      @Arg("info") info: SponsorCreateInput,
  ): Promise<CreateSponsorResponse> {
    const user = ctx.user!;

    const season = await ctx.prisma.season.findUnique({
      where: {
        uid: seasonUid,
      },
      select: {
        id: true,
      },
    });

    if (!season) {
      return {
        errors: [
          {
            field: "entity",
            message: "Season does not exist",
          },
        ],
      };
    }

    try {
      const entity = await ctx.prisma.$transaction(async (prisma) => {
        const photo = await ImageService.uploadImage(
          "sponsors" as ImageBase,
          await info.photo,
          user,
          prisma,
        );

        if (!photo) {
          throw new Error("Couldn't upload photo");
        }

        const latestSponsor = await prisma.sponsor.findFirst({
          where: {
            forSeasonId: season.id,
          },
          orderBy: {
            order: "desc",
          },
        });

        return prisma.sponsor.create({
          data: {
            name: info.name,
            url: info.url,
            photoId: photo.id,
            forSeasonId: season.id,
            order: (latestSponsor?.order || 0) + 1,
          },
        });
      });

      void EventsService.logEvent(
        "sponsor:create",
        user.id,
        {
          name: info.name,
          url: info.url,
        },
      );

      return {
        entity,
      };
    } catch (e) {
      return {
        errors: [
          {
            field: "entity",
            message: (e as Error)?.message || "Something went wrong",
          },
        ],
      };
    }
  }

  @Mutation(() => Boolean)
  @Authorized(Role.Admin)
  async deleteSponsor(
  @Ctx() ctx: Context,
    @Arg("sponsor") sponsorUid: string,
  ) {
    const user = ctx.user!;

    const success = await ctx.prisma.$transaction(async (prisma) => {
      const sponsor = await prisma.sponsor.delete({
        where: {
          uid: sponsorUid,
        },
        select: {
          order: true,
          photo: {
            select: {
              uid: true,
            },
          },
        },
      }).catch(() => null);

      if (!sponsor) {
        throw new Error("Sponsor does not exist");
      }

      await prisma.sponsor.updateMany({
        where: {
          order: {
            gt: sponsor.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      return ImageService.deleteImage(
        sponsor.photo.uid,
        user,
        prisma,
      );
    }).catch(() => false);

    return await Promise.resolve(success);
  }

  @Mutation(() => Boolean)
  @Authorized(Role.Admin)
  async swapSponsorOrder(
  @Ctx() ctx: Context,
    @Arg("season") seasonUid: string,
    @Arg("orderA", () => Int) orderA: number,
    @Arg("orderB", () => Int) orderB: number,
  ) {
    await swap(
      "sponsor",
      ctx.prisma,
      {
        a: orderA,
        b: orderB,
      },
      {
        forSeason: {
          uid: seasonUid,
        },
      },
    );

    return true;
  }
}
