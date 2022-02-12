import {
  Arg,
  Args,
  ArgsType,
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
  File,
  PressRelease,
  FindManyPressReleaseArgs,
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
  ValidationResponseFor,
} from "../helpers/validation";
import {
  FileService,
  MinioBase,
} from "../../services/file-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  PressReleaseValidation,
} from "../../services/validation-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";

@Resolver((_of) => PressRelease)
export class PressReleaseFieldResolver {
  @FieldResolver((_type) => File, { nullable: true })
  file(
  @Root() pressRelease: PressRelease,
  ) {
    return pressRelease.file;
  }
}

export const transformSelect = transformSelectFor<PressReleaseFieldResolver>({
  file(select) {
    select.file = {
      select: select.file,
    };

    return select;
  },
});

@ObjectType()
class CreatePressReleaseResponse extends ValidationResponseFor(PressRelease) {
}

@InputType()
class PressReleaseWithFilesCreateInput {
  @Field()
    title: string = "";

  @Field(() => Date)
    published: Date | null = null;

  @Field(() => GraphQLUpload, { nullable: true })
    file: FileUpload | null = null;
}

@InputType()
class PressReleaseWhereUniqueInput {
  @Field()
    uid: string = "";
}

@ArgsType()
class PressReleaseFindManyArgs extends FindManyPressReleaseArgs {
  @Field(() => PressReleaseWhereUniqueInput, { nullable: true })
    cursor?: PressReleaseWhereUniqueInput = undefined;
}

const canViewRelease =
  (user?: SessionUser | null) =>
    (release: PressRelease) =>
      release.published <= new Date() || hasAtLeastRole(Role.PR, user)
;

@Resolver((_of) => PressRelease)
export class PressReleaseFindResolver {
  @Query(() => [ PressRelease ])
  async pressReleases(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Args() args: PressReleaseFindManyArgs,
  ): Promise<PressRelease[]> {
    const releases = await ctx.prisma.pressRelease.findMany({
      ...args,
      select: toSelect(info, transformSelect),
    }) as PressRelease[];

    const canView = canViewRelease(ctx.user);

    return releases.filter(canView);
  }

  @Query(() => PressRelease, { nullable: true })
  async pressRelease(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("uid") uid: string,
  ): Promise<PressRelease | null> {
    const release = await ctx.prisma.pressRelease.findUnique({
      where: {
        uid,
      },
      select: {
        ...toSelect(info, transformSelect),
        published: true,
      },
    }) as PressRelease | null;

    if (!release) {
      return null;
    }

    if (!canViewRelease(ctx.user)(release)) {
      return null;
    }

    return release;
  }
}

@Resolver((_of) => PressRelease)
export class PressReleaseResolver {
  @Mutation(() => CreatePressReleaseResponse, { nullable: true })
  async createPressRelease(
    @Ctx() ctx: Context,
      @Arg("info") info: PressReleaseWithFilesCreateInput,
  ): Promise<CreatePressReleaseResponse | null> {
    const { user } = ctx;

    if (!user) {
      return null;
    }

    if (!hasAtLeastRole(Role.PR, user)) {
      return null;
    }

    const validation = await PressReleaseValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    if (!info.file) {
      return {
        errors: [
          {
            field: "file",
            message: "File is required",
          },
        ],
      };
    }

    const file = await FileService.uploadFile(`press/press-release/${ user.id }` as MinioBase, await info.file, user);

    if (!file) {
      return {
        errors: [
          {
            field: "file",
            message: "Something went wrong",
          },
        ],
      };
    }

    const release = await ctx.prisma.pressRelease.create({
      data: {
        title: info.title,
        published: info.published || new Date(),
        file: {
          connect: {
            id: file.id,
          },
        },
        creator: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (!release) {
      return {
        errors: [
          {
            field: "entity",
            message: "Something went wrong",
          },
        ],
      };
    }

    void EventsService.logEvent("press-release:create", user.id);

    return {
      entity: release,
    };
  }

  @Mutation(() => CreatePressReleaseResponse, { nullable: true })
  async updatePressRelease(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
      @Arg("info") info: PressReleaseWithFilesCreateInput,
  ): Promise<CreatePressReleaseResponse | null> {
    const { user } = ctx;

    if (!user) {
      return null;
    }

    if (!hasAtLeastRole(Role.PR, user)) {
      return null;
    }

    const validation = await PressReleaseValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    const oldRelease = await ctx.prisma.pressRelease.findUnique({
      where: {
        uid,
      },
      select: {
        file: {
          select: {
            minioKey: true,
            id: true,
          },
        },
      },
    });

    if (!oldRelease) {
      return {
        errors: [
          {
            field: "entity",
            message: "Release does not exist",
          },
        ],
      };
    }

    const data = {
      title: info.title,
      published: info.published || new Date(),
    };

    if (info.file) {
      const file = await FileService.uploadFile(`press/press-release/${ user.id }` as MinioBase, await info.file, user);

      if (!file) {
        return {
          errors: [
            {
              field: "file",
              message: "Something went wrong",
            },
          ],
        };
      }

      (data as Record<string, unknown>).file = {
        connect: {
          id: file.id,
        },
      };
    }

    const release = await ctx.prisma.$transaction(async (prisma) => {
      const release = await prisma.pressRelease.update({
        data,
        where: {
          uid,
        },
      });

      if (info.file) {
        await prisma.file.delete({
          where: {
            id: oldRelease.file.id,
          },
        });
        await FileService.deleteFile(oldRelease.file.minioKey, user);
      }

      return release;
    });

    if (!release) {
      return {
        errors: [
          {
            field: "entity",
            message: "Something went wrong",
          },
        ],
      };
    }

    void EventsService.logEvent("press-release:update", user.id);

    return {
      entity: release,
    };
  }
}
