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
  Partner,
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

@Resolver(() => Partner)
export class PartnerFieldResolver {
  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() partner: Partner,
  ): Image | null {
    return partner.photo || null;
  }
}

export const transformSelect = transformSelectFor<PartnerFieldResolver>({
  photo(select) {
    select.photo = {
      select: transformSelectPhoto(select.photo as Record<string, unknown>),
    };

    return select;
  },
});

@InputType()
export class PartnerCreateInput {
  @Field()
    name: string = "";

  @Field()
    url: string = "";

  @Field(() => GraphQLUpload)
    photo: FileUpload = null as unknown as FileUpload;
}

export class PartnerQueryResolver {
  @Query(() => [ Partner ])
  partners(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Arg("season", { nullable: true }) seasonUid: string,
  ) {
    const now = new Date();

    return ctx.prisma.partner.findMany({
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
class CreatePartnerResponse extends ValidationResponseFor(Partner) {
}

export class AdminPartnerCreateResolver {
  @Mutation(() => CreatePartnerResponse)
  @Authorized(Role.Admin)
  async createPartner(
    @Ctx() ctx: Context,
      @Arg("season") seasonUid: string,
      @Arg("info") info: PartnerCreateInput,
  ): Promise<CreatePartnerResponse> {
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
          "partners" as ImageBase,
          await info.photo,
          user,
          prisma,
        );

        if (!photo) {
          throw new Error("Couldn't upload photo");
        }

        const latestPartner = await prisma.partner.findFirst({
          where: {
            forSeasonId: season.id,
          },
          orderBy: {
            order: "desc",
          },
        });

        return prisma.partner.create({
          data: {
            name: info.name,
            url: info.url,
            photoId: photo.id,
            forSeasonId: season.id,
            order: (latestPartner?.order || 0) + 1,
          },
        });
      });

      void EventsService.logEvent(
        "partner:create",
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
  async deletePartner(
  @Ctx() ctx: Context,
    @Arg("partner") partnerUid: string,
  ) {
    const user = ctx.user!;

    const success = await ctx.prisma.$transaction(async (prisma) => {
      const partner = await prisma.partner.delete({
        where: {
          uid: partnerUid,
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

      if (!partner) {
        throw new Error("Partner does not exist");
      }

      await prisma.partner.updateMany({
        where: {
          order: {
            gt: partner.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      return ImageService.deleteImage(
        partner.photo.uid,
        user,
        prisma,
      );
    }).catch(() => false);

    return await Promise.resolve(success);
  }

  @Mutation(() => Boolean)
  @Authorized(Role.Admin)
  async swapPartnerOrder(
  @Ctx() ctx: Context,
    @Arg("season") seasonUid: string,
    @Arg("orderA", () => Int) orderA: number,
    @Arg("orderB", () => Int) orderB: number,
  ) {
    await swap(
      "partner",
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
