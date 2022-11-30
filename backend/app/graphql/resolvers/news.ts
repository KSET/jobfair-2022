import {
  Arg,
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
import kebabCase from "lodash/fp/kebabCase";
import {
  Image,
  News,
  NewsCreateInput as NewsCreateInputBase,
  User,
} from "@generated/type-graphql";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Context,
  SessionUser,
} from "../../types/apollo-context";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  NewsValidation,
} from "../../services/validation-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  ImageBase,
  ImageService,
} from "../../services/image-service";
import {
  toSelect,
  transformSelectDefaults,
  transformSelectFor,
} from "../helpers/resolver";
import {
  captureError,
} from "../../services/error-service";
import {
  transformSelect as transformSelectUser,
} from "./user";
import {
  transformSelect as transformSelectImage,
} from "./image";

@Resolver(() => News)
export class NewsFieldResolver {
  @FieldResolver(() => User, { nullable: true })
  author(
    @Root() news: News,
  ): GQLField<User, "nullable"> {
    return news.author ?? null;
  }

  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() news: News,
  ): GQLField<Image, "nullable"> {
    return news.photo ?? null;
  }
}

export const transformSelect = transformSelectFor<NewsFieldResolver>({
  ...transformSelectDefaults({
    author: transformSelectUser,
    photo: transformSelectImage,
  }),
});

@InputType()
class NewsFilter {
  @Field(() => Int, { nullable: true })
    take: number = 0;
}

@ObjectType()
class NewsCreateResponse extends ValidationResponseFor(News) {
}

@InputType()
class NewsCreateInput extends NewsCreateInputBase {
  @Field(() => GraphQLUpload, { nullable: true })
    photo: FileUpload | null = null;
}

class NewsCreateError extends Error {
  public field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

const dateFilter =
  (user?: SessionUser | null) =>
    hasAtLeastRole(Role.PR, user)
      ? undefined
      : {
        gte: new Date(),
      }
;

export class NewsQueryResolver {
  @Query(() => [ News ])
  async allNews(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("filter", { nullable: true }) filter?: NewsFilter,
  ): GQLResponse<News[]> {
    const select = toSelect(info, transformSelect);

    return await ctx.prisma.news.findMany({
      take: filter?.take,
      where: {
        date: dateFilter(ctx.user),
      },
      select,
      orderBy: [
        {
          date: "desc",
        },
        {
          lang: "desc",
        },
      ],
    });
  }

  @Query(() => News, { nullable: true })
  newsItem(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("slug") slug: string,
  ): GQLResponse<News, "nullable"> {
    return ctx.prisma.news.findFirst({
      where: {
        slug,
        date: dateFilter(ctx.user),
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => [ News ])
  news(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("lang") lang: string,
      @Arg("filter", { nullable: true }) filter?: NewsFilter,
  ): GQLResponse<News[]> {
    return ctx.prisma.news.findMany({
      where: {
        lang,
        date: dateFilter(ctx.user),
      },
      take: filter?.take || undefined,
      select: toSelect(info, transformSelect),
      orderBy: {
        date: "desc",
      },
    });
  }

  @Query(() => News, { nullable: true })
  newsItemByUid(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("uid") uid: string,
  ): GQLResponse<News, "nullable"> {
    return ctx.prisma.news.findFirst({
      where: {
        uid,
        date: dateFilter(ctx.user),
      },
      select: toSelect(info, transformSelect),
    });
  }
}

export class NewsMutationResolver {
  @Authorized()
  @Mutation(() => NewsCreateResponse, { nullable: true })
  async createNews(
    @Ctx() ctx: Context,
      @Arg("info", () => NewsCreateInput) info: NewsCreateInput,
  ): GQLResponse<NewsCreateResponse, "nullable"> {
    const { user } = ctx;
    if (!hasAtLeastRole(Role.PR, user)) {
      return null;
    }

    const validation = await NewsValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    const ret = await ctx.prisma.$transaction(async (prisma) => {
      let slug = kebabCase(info.title);
      const slugExists = await prisma.news.findFirst({
        where: {
          slug,
        },
        select: {
          id: true,
        },
      });

      if (slugExists) {
        slug = `${ slug }-${ slugExists.id }${ Math.random().toString(36).substring(2) }`;
      }

      const photo = await ImageService.uploadImage(
        `news/${ slug }` as ImageBase,
        await info.photo!,
        user,
        prisma,
      );

      if (!photo) {
        throw new NewsCreateError("photo", "Something went wrong while uploading the photo");
      }

      return prisma.news.create({
        data: {
          ...info,
          slug,
          photo: {
            connect: {
              id: photo.id,
            },
          },
          author: {
            connect: {
              id: user.id,
            },
          },
        },
        include: {
          photo: true,
        },
      });
    }).then((res) => ({ success: true as const, res })).catch((err: Error) => ({ success: false as const, err }));

    if (ret.success) {
      return {
        entity: ret.res,
      };
    }

    if (ret.err instanceof NewsCreateError) {
      return {
        errors: [
          {
            field: ret.err.field,
            message: ret.err.message,
          },
        ],
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

  @Authorized()
  @Mutation(() => NewsCreateResponse, { nullable: true })
  async editNews(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("uid") uid: string,
      @Arg("info", () => NewsCreateInput) info: NewsCreateInput,
  ): GQLResponse<NewsCreateResponse, "nullable"> {
    const { user } = ctx;
    if (!hasAtLeastRole(Role.PR, user)) {
      return null;
    }

    const validation = await NewsValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    const ret = await ctx.prisma.$transaction(async (prisma) => {
      const oldNewsExists = await prisma.news.findFirst({
        where: {
          uid,
        },
        select: {
          slug: true,
          photo: {
            select: {
              uid: true,
            },
          },
        },
      });

      if (!oldNewsExists) {
        throw new NewsCreateError("entity", "News not found");
      }

      let photoConnect;
      const resPhoto = await info.photo;
      if (resPhoto) {
        const photo = await ImageService.uploadImage(
          `news/${ oldNewsExists.slug }` as ImageBase,
          resPhoto,
          user,
          prisma,
        );

        if (!photo) {
          throw new NewsCreateError("photo", "Something went wrong while uploading the photo");
        }

        photoConnect = {
          connect: {
            id: photo.id,
          },
        };
      }

      const res = await prisma.news.update({
        where: {
          uid,
        },
        data: {
          ...info,
          photo: photoConnect,
          author: {
            connect: {
              id: user.id,
            },
          },
        },
        select: transformSelect(toSelect(gqlInfo, (x) => x).entity as Dict || { uid: true }),
      });

      if (photoConnect) {
        await ImageService.deleteImage(
          oldNewsExists.photo.uid,
          user,
          prisma,
        ).catch(() => null);
      }

      return res;
    }).then((res) => ({ success: true as const, res: res as News })).catch((err: Error) => ({ success: false as const, err }));

    if (ret.success) {
      return {
        entity: ret.res,
      };
    }

    if (ret.err instanceof NewsCreateError) {
      return {
        errors: [
          {
            field: ret.err.field,
            message: ret.err.message,
          },
        ],
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

  @Authorized()
  @Mutation(() => Boolean, { nullable: true })
  async deleteNews(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
  ): GQLResponse<boolean, "nullable"> {
    const { user } = ctx;
    if (!hasAtLeastRole(Role.PR, user)) {
      return null;
    }

    const ret = await ctx.prisma.$transaction(async (prisma) => {
      const news = await prisma.news.findFirst({
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

      if (!news) {
        return true;
      }

      await prisma.news.delete({
        where: {
          uid,
        },
      });

      await ImageService.deleteImage(
        news.photo.uid,
        user,
        prisma,
      ).catch(() => null);
    }).then(() => ({ success: true as const })).catch((err: Error) => ({ success: false as const, err }));

    if (ret.success) {
      return true;
    }

    captureError(ret.err);

    return false;
  }
}
