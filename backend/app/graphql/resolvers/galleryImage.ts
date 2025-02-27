import {
  GalleryImage, SponsorCreateInput,
} from "@generated/type-graphql";
import {
  Arg, Authorized, Ctx, Field, Info, InputType, Int, Mutation, ObjectType, Query, Resolver,
} from "type-graphql";
import {
  type GraphQLResolveInfo,
} from "graphql";
import {
  type FileUpload, GraphQLUpload,
} from "graphql-upload";
import {
  type Context,
} from "../../types/apollo-context";
import {
  toSelect, transformSelectFor,
} from "../helpers/resolver";
import {
  type Dict, type GQLResponse,
} from "../../types/helpers";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  hasAtLeastRole, Role,
} from "../../helpers/auth";
import {
  prisma,
} from "../../providers/prisma";
import {
  type ImageBase, ImageService,
} from "../../services/image-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  swap,
} from "../../services/helpers/orderable";

@Resolver(() => GalleryImage)
export class GalleryImageFieldResolver {

}

export const transformSelect = transformSelectFor<GalleryImageFieldResolver>({

});

@InputType()
export class GalleryImageCreateInput {
  @Field()
    name: string = "";

  // @Field()
  //   order: number = 0;

  @Field()
    visible: boolean = false;

  @Field(() => GraphQLUpload)
    photo: FileUpload = null as unknown as FileUpload;
}


@ObjectType()
class CreateGalleryImageResponse extends ValidationResponseFor(GalleryImage) {
}

export class GalleryImageQueryResolver {
  @Query(() => [ GalleryImage ])
  galleryImages(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
  ): GQLResponse<GalleryImage[]> {
    return ctx.prisma.galleryImage.findMany({
      where: {
        visible: true,
      },
      select: toSelect(info, transformSelect),
      orderBy: {
        order: "asc",
      },
    });
  }

  @Query(() => [ GalleryImage ])
  allGalleryImages(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
  ): GQLResponse<GalleryImage[]> {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return Promise.resolve([]);
    }
    return ctx.prisma.galleryImage.findMany({
      select: toSelect(info, transformSelect),
      orderBy: {
        order: "asc",
      },
    });
  }

  @Mutation(() => CreateGalleryImageResponse, { nullable: true })
  async createGalleryImage(
    @Ctx() ctx: Context,
      @Arg("info") info: GalleryImageCreateInput,
  ): GQLResponse<CreateGalleryImageResponse, "nullable"> {
    const { user } = ctx;

    if (!user) {
      return null;
    };

    if (!hasAtLeastRole(Role.Admin, user)) {
      return null;
    }

    try {
      const entity = await ctx.prisma.$transaction(async (prisma) => {
        const photo = await ImageService.uploadImage(
          "gallery" as ImageBase,
          await info.photo,
          user,
          prisma,
        );

        if (!photo) {
          throw new Error("Couldn't upload photo");
        }

        const latestGalleryImage = await prisma.galleryImage.findFirst({
          orderBy: {
            order: "desc",
          },
        });

        return prisma.galleryImage.create({
          data: {
            name: info.name,
            visible: info.visible,
            photoId: photo.id,
            order: (latestGalleryImage?.order || 0) + 1,
          },
        });
      });

      void EventsService.logEvent(
        "galleryImage:create",
        user.id,
        {
          name: info.name,
          photoUid: entity.uid,
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

  @Mutation(() => CreateGalleryImageResponse, { nullable: true })
  async editGalleryImage(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("uid") uid: string,
      @Arg("info") info: GalleryImageCreateInput,
  ): GQLResponse<CreateGalleryImageResponse, "nullable"> {
    const { user } = ctx;

    if (!user) {
      return null;
    };

    if (!hasAtLeastRole(Role.Admin, user)) {
      return null;
    }

    const ret = await ctx.prisma.$transaction(async (prisma) => {
      const oldGalleryImageExists = await prisma.galleryImage.findFirst({
        where: {
          uid,
        },
        select: {
          photo: {
            select: {
              uid: true,
            },
          },
        },
      });

      if (!oldGalleryImageExists) {
        throw new Error(`No user with uid ${ uid }`);
      }

      let photoConnect;
      const resPhoto = await info.photo;
      if (resPhoto) {
        const photo = await ImageService.uploadImage(
          "gallery" as ImageBase,
          resPhoto,
          user,
          prisma,
        );

        if (!photo) {
          throw new Error("Something went wrong while uploading the photo");
        }

        photoConnect = {
          connect: {
            id: photo.id,
          },
        };
      }

      const res = await prisma.galleryImage.update({
        where: {
          uid,
        },
        data: {
          name: info.name,
          visible: info.visible,
          photo: photoConnect,
        },
        select: transformSelect(toSelect(gqlInfo, (x) => x).entity as Dict || { uid: true }),
      });

      if (photoConnect) {
        await ImageService.deleteImage(
          oldGalleryImageExists.photo.uid,
          user,
          prisma,
        ).catch(() => null);
      }

      return res;
    }).then((res) => ({ success: true as const, res: res as unknown as GalleryImage })).catch((err: Error) => ({ success: false as const, err }));

    if (ret.success) {
      return {
        entity: ret.res,
      };
    }

    return {
      errors: [
        {
          field: "entity",
          message: ret.err.message,
        },
      ],
    };
  }

  @Mutation(() => Boolean)
  async deleteGalleryImage(
  @Ctx() ctx: Context,
    @Arg("galleryImage") galleryImageUid: string,
  ) {
    const { user } = ctx;

    if (!user) {
      return false;
    };

    if (!hasAtLeastRole(Role.Admin, user)) {
      return false;
    }

    const success = await ctx.prisma.$transaction(async (prisma) => {
      const galleryImage = await prisma.galleryImage.delete({
        where: {
          uid: galleryImageUid,
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

      if (!galleryImage) {
        throw new Error("GalleryImage does not exist");
      }

      await prisma.galleryImage.updateMany({
        where: {
          order: {
            gt: galleryImage.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      return ImageService.deleteImage(
        galleryImage.photo.uid,
        user,
        prisma,
      );
    }).catch(() => false);

    return Promise.resolve(success);
  }

  @Mutation(() => Boolean)
  async swapGalleryImageOrder(
  @Ctx() ctx: Context,
    @Arg("orderA", () => Int) orderA: number,
    @Arg("orderB", () => Int) orderB: number,
  ) {
    await swap(
      "galleryImage",
      ctx.prisma,
      {
        a: orderA,
        b: orderB,
      },
    );

    return true;
  }
}

