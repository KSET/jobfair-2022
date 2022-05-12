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
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import {
  Resume,
  ResumeFaculty,
  ResumeWorkExperience,
  ResumeProject,
  ResumeVolunteerExperience,
  ResumeStudyYear,
  User,
  File,
  ResumeWhereInput,
  ResumeOrderByWithRelationAndSearchRelevanceInput,
} from "@generated/type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import * as Sentry from "@sentry/node";
import {
  clamp,
  mergeDeepRight,
} from "rambdax";
import {
  toSelect,
  transformSelectDefaults,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  Context,
} from "../../types/apollo-context";
import {
  ResumeValidation,
} from "../../services/validation-service";
import {
  FileService,
  MinioBase,
} from "../../services/file-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  ResumeFacultyCreateInput,
  transformSelect as transformSelectFaculty,
} from "./resumeFaculty";
import {
  ResumeWorkExperienceCreateInput,
  transformSelect as transformSelectWorkExperience,
} from "./resumeWorkExperience";
import {
  ResumeProjectCreateInput,
  transformSelect as transformSelectProject,
} from "./resumeProject";
import {
  ResumeVolunteerExperienceCreateInput,
  transformSelect as transformSelectProjectVolunteerExperience,
} from "./resumeVolunteerExperience";
import {
  transformSelect as transformSelectFile,
} from "./file";
import {
  transformSelect as transformSelectUser,
} from "./user";
import {
  ResumeStudyYearCreateInput,
  transformSelect as transformSelectStudyYear,
} from "./resumeStudyYear";

@Resolver(() => Resume)
export class ResumeFieldResolver {
  @FieldResolver((_type) => ResumeFaculty, { nullable: true })
  faculty(
    @Root() resume: Resume,
  ): GQLField<ResumeFaculty, "nullable"> {
    return resume.faculty;
  }

  @FieldResolver((_type) => [ String ])
  technologies(
    @Root() resume: Resume,
  ): GQLField<string[]> {
    return resume.technologies?.map((x) => x.name) || [];
  }

  @FieldResolver((_type) => [ String ])
  interests(
    @Root() resume: Resume,
  ): GQLField<string[]> {
    return resume.interests?.map((x) => x.name) || [];
  }

  @FieldResolver((_type) => [ ResumeStudyYear ])
  studyYears(
    @Root() resume: Resume,
  ): GQLField<ResumeStudyYear[]> {
    return resume.studyYears || [];
  }

  @FieldResolver((_type) => [ ResumeWorkExperience ])
  workExperiences(
    @Root() resume: Resume,
  ): GQLField<ResumeWorkExperience[]> {
    return resume.workExperiences || [];
  }

  @FieldResolver((_type) => [ ResumeProject ])
  projects(
    @Root() resume: Resume,
  ): GQLField<ResumeProject[]> {
    return resume.projects || [];
  }

  @FieldResolver((_type) => [ ResumeVolunteerExperience ])
  volunteerExperiences(
    @Root() resume: Resume,
  ): GQLField<ResumeVolunteerExperience[]> {
    return resume.volunteerExperiences || [];
  }

  @FieldResolver((_type) => File, { nullable: true })
  cv(
    @Root() resume: Resume,
  ): GQLField<File, "nullable"> {
    return resume.cv;
  }

  @FieldResolver((_type) => User)
  user(
    @Root() resume: Resume,
  ): GQLField<User> {
    return resume.user!;
  }
}

export const transformSelect = transformSelectFor<ResumeFieldResolver>({
  ...transformSelectDefaults({
    faculty: transformSelectFaculty,
    workExperiences: transformSelectWorkExperience,
    projects: transformSelectProject,
    volunteerExperiences: transformSelectProjectVolunteerExperience,
    cv: transformSelectFile,
    studyYears: transformSelectStudyYear,
  }),

  technologies(select) {
    select.technologies = {
      select: {
        id: true,
        name: true,
      },
    };

    return select;
  },

  interests(select) {
    select.interests = {
      select: {
        id: true,
        name: true,
      },
    };

    return select;
  },

  user(select) {
    select.user = {
      select: transformSelectUser(select.user as Dict),
    };

    return select;
  },
});


@ObjectType()
class ResumeCreateResponse extends ValidationResponseFor(Resume) {
}

@InputType()
class ResumeCreateCvInput {
  @Field(() => GraphQLUpload, { nullable: true })
    cv?: FileUpload;

  @Field()
    keepOld: boolean = true;
}

@InputType()
class ResumeCreateInput {
  @Field(() => ResumeCreateCvInput, { nullable: true })
    pdf?: ResumeCreateCvInput;

  @Field(() => [ ResumeStudyYearCreateInput ])
    studyYears: ResumeStudyYearCreateInput[] = [];

  @Field(() => ResumeFacultyCreateInput)
    faculty?: ResumeFacultyCreateInput;

  @Field(() => [ ResumeWorkExperienceCreateInput ])
    workExperiences: ResumeWorkExperienceCreateInput[] = [];

  @Field(() => [ ResumeProjectCreateInput ])
    projects: ResumeProjectCreateInput[] = [];

  @Field(() => [ ResumeVolunteerExperienceCreateInput ])
    volunteerExperiences: ResumeVolunteerExperienceCreateInput[] = [];

  @Field(() => [ String ])
    technologies: string[] = [];

  @Field(() => [ String ])
    interests: string[] = [];

  @Field(() => String)
    city: string = "";

  @Field(() => String, { nullable: true })
    extraField?: string | undefined = "";
}

@InputType()
class ResumeFindManyInput {
  @Field(() => ResumeWhereInput, { nullable: true })
    where?: ResumeWhereInput | undefined;

  @Field(() => String, { nullable: true })
    whereUser?: string | undefined;

  @Field(() => [ ResumeOrderByWithRelationAndSearchRelevanceInput ], { nullable: true })
    orderBy?: ResumeOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @Field(() => Int, { nullable: true })
    take?: number | undefined;

  @Field(() => Int, { nullable: true })
    skip?: number | undefined;
}

@ObjectType()
class ResumeList {
  @Field(() => Int)
    total: number = 0;

  @Field(() => [ Resume ])
    items: Resume[] = [];
}

@Resolver((_of) => Resume)
export class ResumeInfoResolver {
  @Authorized()
  @Query(() => Resume, { nullable: true })
  resume(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<Resume, "nullable"> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return Promise.resolve(null);
    }

    return ctx.prisma.resume.findFirst({
      where: {
        uid,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Authorized()
  @Query(() => Boolean)
  async resumeIsFavourite(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
  ): GQLResponse<boolean> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return false;
    }

    const companyUid = user.companies[0].uid;

    const entry = await ctx.prisma.favouriteResume.findFirst({
      where: {
        company: {
          uid: companyUid,
        },
        resume: {
          uid,
        },
        season: {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        },
      },
      select: {
        id: true,
      },
    });

    return null !== entry;
  }

  @Authorized()
  @Query(() => [ String ])
  async resumeFavourites(
    @Ctx() ctx: Context,
  ): GQLResponse<string[]> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return [];
    }

    const companyUid = user.companies[0].uid;

    const entries = await ctx.prisma.favouriteResume.findMany({
      where: {
        company: {
          uid: companyUid,
        },
        season: {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        },
      },
      select: {
        resume: {
          select: {
            uid: true,
          },
        },
      },
    });

    return entries.map((entry) => entry.resume.uid);
  }

  @Authorized()
  @Query(() => ResumeList)
  async resumes(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("filter", () => ResumeFindManyInput, { nullable: true }) filter?: ResumeFindManyInput,
  ): GQLResponse<ResumeList> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return {
        total: 0,
        items: [],
      };
    }

    const where: ResumeWhereInput = mergeDeepRight(
      filter?.where || {},
      filter?.whereUser
        ? {
          user: {
            OR: [
              {
                firstName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
            ],
          },
        }
        : {},
    );

    const [
      total,
      items,
    ] = await Promise.all([
      ctx.prisma.resume.count({
        where,
      }),
      ctx.prisma.resume.findMany({
        select: transformSelect(toSelect(gqlInfo, (x) => x).items as Dict || { id: true }),
        take: clamp(1, 50, filter?.take ?? 10),
        skip: clamp(0, Infinity, filter?.skip ?? 0),
        where,
        orderBy: filter?.orderBy || {
          updatedAt: "desc",
        },
      }),
    ]);

    return {
      total,
      items: items as Resume[],
    };
  }

  @Authorized()
  @Query(() => ResumeList)
  async resumesFavourites(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("filter", () => ResumeFindManyInput, { nullable: true }) filter?: ResumeFindManyInput,
  ): GQLResponse<ResumeList> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return {
        total: 0,
        items: [],
      };
    }

    const where: ResumeWhereInput = mergeDeepRight(
      filter?.where || {},
      filter?.whereUser
        ? {
          user: {
            OR: [
              {
                firstName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
            ],
          },
        }
        : {},
    );

    const [
      total,
      items,
    ] = await Promise.all([
      ctx.prisma.favouriteResume.count({
        where: {
          resume: where,
          company: {
            uid: user.companies[0].uid,
          },
        },
      }),
      ctx.prisma.favouriteResume.findMany({
        select: {
          resume: {
            select: transformSelect(toSelect(gqlInfo, (x) => x).items as Dict || { id: true }),
          },
        },
        take: clamp(1, 50, filter?.take ?? 10),
        skip: clamp(0, Infinity, filter?.skip ?? 0),
        where: {
          resume: where,
          company: {
            uid: user.companies[0].uid,
          },
        },
        orderBy: {
          resume:
            filter?.orderBy
              ? filter.orderBy[0]
              : {
                updatedAt: "desc",
              }
          ,
        },
      }),
    ]);

    return {
      total,
      items: items.map((item) => item.resume) as Resume[],
    };
  }

  @Authorized()
  @Query(() => ResumeList)
  async resumesScanned(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Arg("filter", () => ResumeFindManyInput, { nullable: true }) filter?: ResumeFindManyInput,
  ): GQLResponse<ResumeList> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return {
        total: 0,
        items: [],
      };
    }

    const where: ResumeWhereInput = mergeDeepRight(
      filter?.where || {},
      filter?.whereUser
        ? {
          user: {
            OR: [
              {
                firstName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: filter.whereUser,
                  mode: "insensitive",
                },
              },
            ],
          },
        }
        : {},
    );

    const [
      total,
      items,
    ] = await Promise.all([
      ctx.prisma.scannedResume.count({
        where: {
          resume: where,
          company: {
            uid: user.companies[0].uid,
          },
        },
      }),
      ctx.prisma.scannedResume.findMany({
        select: {
          resume: {
            select: transformSelect(toSelect(gqlInfo, (x) => x).items as Dict || { id: true }),
          },
        },
        take: clamp(1, 50, filter?.take ?? 10),
        skip: clamp(0, Infinity, filter?.skip ?? 0),
        where: {
          resume: where,
          company: {
            uid: user.companies[0].uid,
          },
        },
        orderBy: {
          resume:
            filter?.orderBy
              ? filter.orderBy[0]
              : {
                updatedAt: "desc",
              }
          ,
        },
      }),
    ]);

    return {
      total,
      items: items.map((item) => item.resume) as Resume[],
    };
  }
}

@Resolver((_of) => Resume)
export class ResumeModifyResolver {
  @Mutation(() => ResumeCreateResponse, { nullable: true })
  @Authorized()
  async updateResume(
    @Ctx() ctx: Context,
      @Arg("info") info: ResumeCreateInput,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<ResumeCreateResponse, "nullable"> {
    const { user } = ctx;

    if (!user) {
      return Promise.resolve(null);
    }

    const validation = await ResumeValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors.map((error) => {
          if (error.field.match(/^(technologies|interests)\./)) {
            return {
              ...error,
              field: error.field.split(".").shift()!,
            };
          }

          return error;
        }),
      };
    }

    const resumeSelect = transformSelect(toSelect(gqlInfo, (x) => x).entity as Dict || { uid: true });

    const newResume = await ctx.prisma.$transaction(async (prisma) => {
      const onlyId = {
        select: {
          id: true,
        },
      };

      const oldResume = await prisma.resume.findFirst({
        where: {
          user: {
            id: user.id,
          },
        },
        select: {
          id: true,
          studyYears: onlyId,
          workExperiences: onlyId,
          projects: onlyId,
          volunteerExperiences: onlyId,
          technologies: onlyId,
          interests: onlyId,
          cv: {
            select: {
              id: true,
              minioKey: true,
            },
          },
        },
      });

      const newCvFile =
        // eslint-disable-next-line no-nested-ternary
        info.pdf?.cv
          ? await FileService.uploadFile(
            `user/${ user.id }/resume` as MinioBase,
            await info.pdf.cv,
            user,
            prisma,
          )
          : (info.pdf?.keepOld ? oldResume?.cv : null)
      ;

      if (!oldResume) {
        return prisma.resume.create({
          data: {
            cv:
              newCvFile
                ? {
                  connect: {
                    id: newCvFile.id,
                  },
                }
                : undefined,
            faculty: {
              create: info.faculty,
            },
            technologies: {
              connectOrCreate: info.technologies.map((name) => ({
                where: {
                  name,
                },
                create: {
                  name,
                },
              })),
            },
            interests: {
              connectOrCreate: info.interests.map((name) => ({
                where: {
                  name,
                },
                create: {
                  name,
                },
              })),
            },
            studyYears: {
              createMany: {
                data: info.studyYears,
              },
            },
            city: info.city,
            workExperiences: {
              createMany: {
                data: info.workExperiences,
              },
            },
            projects: {
              createMany: {
                data: info.projects,
              },
            },
            volunteerExperiences: {
              createMany: {
                data: info.volunteerExperiences,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            extraField: info.extraField || "",
          },
          select: resumeSelect,
        });
      }

      const newResume = await prisma.resume.update({
        where: {
          id: oldResume.id,
        },
        data: {
          cv:
            newCvFile
              ? {
                connect: {
                  id: newCvFile.id,
                },
              }
              : {
                disconnect: true,
              },
          faculty: {
            upsert: {
              update: info.faculty!,
              create: info.faculty!,
            },
          },
          technologies: {
            disconnect: oldResume.technologies,
            connectOrCreate: info.technologies.map((name) => ({
              where: {
                name,
              },
              create: {
                name,
              },
            })),
          },
          interests: {
            disconnect: oldResume.interests,
            connectOrCreate: info.interests.map((name) => ({
              where: {
                name,
              },
              create: {
                name,
              },
            })),
          },
          studyYears: {
            deleteMany: {
              id: {
                in: oldResume.studyYears.map((x) => x.id),
              },
            },
            createMany: {
              data: info.studyYears,
            },
          },
          city: info.city,
          workExperiences: {
            deleteMany: {
              id: {
                in: oldResume.workExperiences.map((x) => x.id),
              },
            },
            createMany: {
              data: info.workExperiences,
            },
          },
          projects: {
            deleteMany: {
              id: {
                in: oldResume.projects.map((x) => x.id),
              },
            },
            createMany: {
              data: info.projects,
            },
          },
          volunteerExperiences: {
            deleteMany: {
              id: {
                in: oldResume.volunteerExperiences.map((x) => x.id),
              },
            },
            createMany: {
              data: info.volunteerExperiences,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          extraField: info.extraField || "",
        },
        select: resumeSelect,
      }) as Resume;

      if (oldResume.cv && newCvFile?.id !== oldResume.cv?.id) {
        await prisma.file.delete({
          where: {
            id: oldResume.cv.id,
          },
        });
        await FileService.deleteFile(oldResume.cv.minioKey, user);
      }

      return newResume;
    }).catch((e) => {
      Sentry.captureException(e);
      return null;
    }) as Resume | null;

    if (!newResume) {
      return {
        errors: [
          {
            field: "entity",
            message: "Something went wrong",
          },
        ],
      };
    }

    return {
      entity: newResume,
    };
  }

  @Mutation(() => Boolean)
  @Authorized()
  deleteResume(
    @Ctx() ctx: Context,
  ): GQLResponse<boolean> {
    const user = ctx.user!;

    return ctx.prisma.$transaction(async (prisma) => {
      const oldResume = await prisma.resume.findFirst({
        where: {
          user: {
            id: user.id,
          },
        },
        select: {
          id: true,
          cv: {
            select: {
              id: true,
              minioKey: true,
            },
          },
        },
      });

      if (!oldResume) {
        return true;
      }

      const deleted = await prisma.resume.delete({
        where: {
          id: oldResume.id,
        },
        select: {
          id: true,
        },
      });

      if (!deleted) {
        throw new Error("Failed to delete resume");
      }

      if (oldResume.cv) {
        await Promise.all([
          prisma.file.delete({
            where: {
              id: oldResume.cv.id,
            },
          }),
          FileService.deleteFile(oldResume.cv.minioKey, user),
        ]).then(() => true).catch(() => false);
      }

      return true;
    }).catch(() => false);
  }

  @Authorized()
  @Mutation(() => Boolean)
  async resumeSetIsFavourite(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
      @Arg("isFavourite") isFavourite: boolean,
  ): GQLResponse<boolean> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return false;
    }

    const resume = await ctx.prisma.resume.findFirst({
      where: {
        uid,
      },
    });

    if (!resume) {
      return false;
    }

    const season = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        uid: true,
      },
    });

    if (!season) {
      return false;
    }

    if (isFavourite) {
      await ctx.prisma.$transaction(async (prisma) => {
        const prev = await prisma.favouriteResume.findFirst({
          where: {
            resume: {
              uid,
            },
            company: {
              uid: user.companies[0].uid,
            },
            season: {
              uid: season.uid,
            },
          },
          select: {
            id: true,
          },
        });

        if (prev) {
          return true;
        }

        return await prisma.favouriteResume.create({
          data: {
            resume: {
              connect: {
                uid,
              },
            },
            company: {
              connect: {
                uid: user.companies[0].uid,
              },
            },
            season: {
              connect: {
                uid: season.uid,
              },
            },
          },
        }).catch((e) => {
          console.log(e);
        });
      }).catch((e) => {
        console.log(e);
      });
    } else {
      await ctx.prisma.favouriteResume.deleteMany({
        where: {
          season: {
            uid: season.uid,
          },
          company: {
            uid: user.companies[0].uid,
          },
          resume: {
            uid,
          },
        },
      }).catch((e) => {
        console.log(e);
      });
    }

    return true;
  }

  @Authorized()
  @Mutation(() => String, { nullable: true })
  async resumeScan(
    @Ctx() ctx: Context,
      @Arg("userUid") userUid: string,
  ): GQLResponse<string, "nullable"> {
    const user = ctx.user!;

    const canView =
      0 < user.companies.length
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return null;
    }

    const resumeUser = await ctx.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
      select: {
        resume: {
          select: {
            uid: true,
          },
        },
      },
    });

    if (!resumeUser) {
      return null;
    }

    const { resume } = resumeUser;

    if (!resume) {
      return null;
    }

    const season = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        uid: true,
      },
    });

    if (!season) {
      return null;
    }

    await ctx.prisma.$transaction(async (prisma) => {
      const prev = await prisma.scannedResume.findFirst({
        where: {
          resume: {
            uid: resume.uid,
          },
          company: {
            uid: user.companies[0].uid,
          },
          season: {
            uid: season.uid,
          },
        },
        select: {
          id: true,
        },
      });

      if (prev) {
        return true;
      }

      return prisma.scannedResume.create({
        data: {
          resume: {
            connect: {
              uid: resume.uid,
            },
          },
          company: {
            connect: {
              uid: user.companies[0].uid,
            },
          },
          season: {
            connect: {
              uid: season.uid,
            },
          },
        },
      }).catch((e) => {
        console.log(e);
      });
    }).catch((e) => {
      console.log(e);
    });

    return resume.uid;
  }

  @Authorized()
  @Mutation(() => Resume, { nullable: true })
  async resumeEntryScan(
    @Ctx() ctx: Context,
      @Arg("userUid") userUid: string,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<Resume, "nullable"> {
    const user = ctx.user!;

    const canView =
      user.email.endsWith("@kset.org")
      || hasAtLeastRole(Role.Admin, user)
    ;

    if (!canView) {
      return null;
    }

    const select = toSelect(gqlInfo, transformSelect);

    const resumeUser = await ctx.prisma.user.findFirst({
      where: {
        uid: userUid,
      },
      select: {
        resume: {
          select: {
            uid: true,
            ...select,
          },
        },
      },
    });

    if (!resumeUser) {
      return null;
    }

    const { resume } = resumeUser;

    if (!resume) {
      return null;
    }

    const season = await ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: new Date(),
        },
        endsAt: {
          gte: new Date(),
        },
      },
      select: {
        uid: true,
      },
    });

    if (!season) {
      return null;
    }

    await ctx.prisma.entryResumeLog.create({
      data: {
        resume: {
          connect: {
            uid: resume.uid,
          },
        },
        season: {
          connect: {
            uid: season.uid,
          },
        },
        scannedBy: {
          connect: {
            uid: user.uid,
          },
        },
      },
    }).catch((e) => {
      console.log(e);
    });

    return resumeUser.resume as Resume;
  }
}
