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
} from "@generated/type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
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

  @Field(() => ResumeFacultyCreateInput, { nullable: true })
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
}

@Resolver((_of) => User)
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


      if (!oldResume) {
        return prisma.resume.create({
          data: {
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
          },
          select: resumeSelect,
        });
      }

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
            deleteMany: {
              id: {
                in: oldResume.technologies.map((x) => x.id),
              },
            },
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
            deleteMany: {
              id: {
                in: oldResume.interests.map((x) => x.id),
              },
            },
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
    }) as Resume;

    return {
      entity: newResume,
    };
  }
}
