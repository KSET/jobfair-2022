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
  Company,
  CompanyCreateInput,
  File,
  FindManyCompanyArgs,
  Image,
  Industry,
  User,
} from "@generated/type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  omit,
} from "rambdax";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import type {
  Prisma,
} from "@prisma/client";
import {
  set,
} from "lodash";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  CompanyValidation,
} from "../../services/validation-service";
import {
  CompanyService,
} from "../../services/company-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import SlackNotificationService from "../../services/slack-notification-service";
import {
  FileService,
  MinioBase,
} from "../../services/file-service";
import {
  ImageBase,
  ImageService,
} from "../../services/image-service";
import {
  Dict,
  GQLResponse,
} from "../../types/helpers";
import {
  transformSelect as transformSelectMembers,
} from "./user";
import {
  transformSelect as transformSelectImage,
} from "./image";
import {
  transformSelect as transformSelectProgram,
  CompanyProgram,
} from "./companyProgram";

const rasterLogoMimeTypes = new Set([
  "image/png",
]);
const rasterLogoExtensions = [
  ".png",
];
const vectorLogoMimeTypes = new Set([
  "application/pdf",
]);
const vectorLogoExtensions = [
  ".ai",
  ".pdf",
  ".eps",
];

type FileValidation = FileUpload | null | undefined;
const fileValid = {
  rasterLogo(file: FileValidation, required: boolean = false) {
    if (!file) {
      return !required;
    }

    return (
      rasterLogoMimeTypes.has(file.mimetype.toLowerCase())
    );
  },

  vectorLogo(file: FileValidation, required: boolean = false) {
    if (!file) {
      return !required;
    }

    return (
      vectorLogoMimeTypes.has(file.mimetype.toLowerCase())
      || vectorLogoExtensions.some((ext) => file.filename.endsWith(ext))
    );
  },
};

@Resolver(() => Company)
export class CompanyFieldResolver {
  @FieldResolver((_type) => Industry, { nullable: true })
  industry(
    @Root() company: Company,
  ): GQLResponse<Industry, "nullable"> {
    return Promise.resolve(company.industry || null);
  }

  @FieldResolver((_type) => [ User ], { nullable: true })
  members(
    @Root() company: Company,
  ): GQLResponse<User[], "nullable"> {
    return Promise.resolve(company.members || null);
  }

  @FieldResolver((_type) => Image, { nullable: true })
  rasterLogo(
    @Root() company: Company,
  ): GQLResponse<Image, "nullable"> {
    return Promise.resolve(company.rasterLogo || null);
  }

  @FieldResolver((_type) => File, { nullable: true })
  vectorLogo(
    @Root() company: Company,
  ): GQLResponse<File, "nullable"> {
    return Promise.resolve(company.vectorLogo || null);
  }

  @FieldResolver((_type) => CompanyProgram, { nullable: true })
  program(
    @Root() company: Company,
  ): GQLResponse<CompanyProgram, "nullable"> {
    return Promise.resolve(company.applications?.[0]);
  }

  @FieldResolver((_type) => Boolean)
  logoHidden(
    @Root() company: Company,
  ): GQLResponse<boolean> {
    const logoHidden = company.applications?.[0]?.approval?.logoHidden ?? false;
    return Promise.resolve(logoHidden);
  }
}

export const transformSelect = transformSelectFor<CompanyFieldResolver>({
  logoHidden(select) {
    set(select, "applications.select.approval.select.logoHidden", true);
    delete select.logoHidden;
    return select;
  },

  industry(select) {
    select.industry = {
      select: select.industry,
    };

    return select;
  },

  members(select) {
    select.members = {
      select: transformSelectMembers(select.members as Record<string, unknown>),
    };

    return select;
  },

  rasterLogo(select) {
    select.rasterLogo = {
      select: transformSelectImage(select.rasterLogo as Record<string, unknown>),
    };

    return select;
  },

  vectorLogo(select) {
    select.vectorLogo = {
      select: select.vectorLogo,
    };

    return select;
  },

  program(select) {
    const result = transformSelectProgram(select.program as Dict);

    delete select.program;

    Object.assign(select, result);

    return select;
  },
});

@InputType()
class CreateCompanyInput extends CompanyCreateInput {
  @Field()
    industry: string = "";

  @Field(() => GraphQLUpload, { nullable: true })
    vectorLogo: FileUpload | null = null;

  @Field(() => GraphQLUpload, { nullable: true })
    rasterLogo: FileUpload | null = null;
}

@ArgsType()
class FindManyParticipantsArgs extends FindManyCompanyArgs {
  @Field(() => String, { nullable: true })
    season?: string | undefined = undefined;
}

@ObjectType()
class VatData {
  @Field()
    address: string = "";

  @Field()
    legalName: string = "";
}

@ObjectType()
class ValidateVatResponse {
  @Field()
    valid: boolean = false;

  @Field()
    exists: boolean = false;

  @Field(() => VatData, { nullable: true })
    info: VatData | null = null;
}

@ObjectType()
class CreateCompanyResponse extends ValidationResponseFor(Company) {
}

@Resolver(() => Company)
export class CompanyValidationResolver {
  @Mutation(() => ValidateVatResponse)
  validateVat(
    @Ctx() ctx: Context,
      @Arg("vat") vat: string,
  ): GQLResponse<ValidateVatResponse> {
    return CompanyService.validateVat(vat);
  }
}

@Resolver(() => Company)
export class CompanyInfoMutationsResolver {
  @Mutation(() => CreateCompanyResponse, { nullable: true })
  async registerCompany(
    @Ctx() ctx: Context,
      @Arg("info", () => CreateCompanyInput) info: CreateCompanyInput,
  ): GQLResponse<CreateCompanyResponse, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    if (ctx.user.companies.length) {
      return {
        errors: [
          {
            field: "entity",
            message: "You are already part of a company",
          },
        ],
      };
    }

    const validation = await CompanyValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    info.vat = info.vat.trim().toUpperCase();

    const vatValidation = await CompanyService.validateVat(info.vat);

    if (!vatValidation.valid) {
      return {
        errors: [
          {
            field: "vat",
            message: "errors.vat.invalid",
          },
        ],
      };
    }

    if (vatValidation.exists) {
      return {
        errors: [
          {
            field: "vat",
            message: "errors.vat.already-exists",
          },
        ],
      };
    }

    const industry = await ctx.prisma.industry.findFirst({
      where: {
        name: info.industry,
      },
    });

    if (!industry) {
      return {
        errors: [
          {
            field: "industry",
            message: "Industry does not exist",
          },
        ],
      };
    }

    const [
      rasterLogoFile,
      vectorLogoFile,
    ] = await Promise.all([
      await info.rasterLogo,
      await info.vectorLogo,
    ]);

    if (!fileValid.vectorLogo(vectorLogoFile)) {
      return {
        errors: [
          {
            field: "vectorLogo",
            message: `File must have extension: ${ vectorLogoExtensions.join(", ") }`,
          },
        ],
      };
    }

    if (!fileValid.rasterLogo(rasterLogoFile)) {
      return {
        errors: [
          {
            field: "rasterLogo",
            message: `File must have extension: ${ rasterLogoExtensions.join(", ") }`,
          },
        ],
      };
    }
    let vectorLogoData;
    if (info.vectorLogo) {
      const vectorLogo = await FileService.uploadFile(
        `company/${ info.vat }/logo/vector` as MinioBase,
        vectorLogoFile!,
        ctx.user,
      );

      if (!vectorLogo) {
        return {
          errors: [
            {
              field: "vectorLogo",
              message: "Something went wrong",
            },
          ],
        };
      }

      vectorLogoData = {
        connect: {
          id: vectorLogo.id,
        },
      };
    }

    let rasterLogoData;
    if (info.rasterLogo) {
      const rasterLogo = await ImageService.uploadImage(
        `company/${ info.vat }/logo/raster` as ImageBase,
        rasterLogoFile!,
        ctx.user,
      );

      if (!rasterLogo) {
        return {
          errors: [
            {
              field: "rasterLogo",
              message: "Something went wrong",
            },
          ],
        };
      }

      rasterLogoData = {
        connect: {
          id: rasterLogo.id,
        },
      };
    }

    const entity = await ctx.prisma.company.create({
      data: {
        ...info,
        industry: {
          connect: {
            id: industry.id,
          },
        },
        members: {
          connect: {
            id: ctx.user.id,
          },
        },
        rasterLogo: rasterLogoData,
        vectorLogo: vectorLogoData,
      },
    });

    if (!entity) {
      return {
        errors: [
          {
            field: "entity",
            message: "Something went wrong",
          },
        ],
      };
    }

    void EventsService.logEvent("company:register", ctx.user.id, { vat: entity.vat });
    void SlackNotificationService.notifyOfNewCompany({ ...entity, industry }, ctx.user);

    return {
      entity,
    };
  }

  @Mutation(() => CreateCompanyResponse, { nullable: true })
  async updateCompanyInfo(
    @Ctx() ctx: Context,
      @Arg("info", () => CreateCompanyInput) info: CreateCompanyInput,
  ): GQLResponse<CreateCompanyResponse, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const validation = await CompanyValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    info.vat = info.vat.trim().toUpperCase();

    const [ company ] = ctx.user.companies;
    const isInCompany = company && company.vat === info.vat;

    if (!isInCompany && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return {
        errors: [
          {
            field: "vat",
            message: "You can not edit the company",
          },
        ],
      };
    }

    const [
      rasterLogoFile,
      vectorLogoFile,
    ] = await Promise.all([
      await info.rasterLogo,
      await info.vectorLogo,
    ]);

    if (!fileValid.vectorLogo(vectorLogoFile)) {
      return {
        errors: [
          {
            field: "vectorLogo",
            message: `File must have extension: ${ vectorLogoExtensions.join(", ") }`,
          },
        ],
      };
    }

    if (!fileValid.rasterLogo(rasterLogoFile)) {
      return {
        errors: [
          {
            field: "rasterLogo",
            message: `File must have extension: ${ rasterLogoExtensions.join(", ") }`,
          },
        ],
      };
    }

    const industry = await ctx.prisma.industry.findFirst({
      where: {
        name: info.industry,
      },
    });

    if (!industry) {
      return {
        errors: [
          {
            field: "industry",
            message: "Industry does not exist",
          },
        ],
      };
    }

    let vectorLogoData;
    if (info.vectorLogo) {
      const vectorLogo = await FileService.uploadFile(
        `company/${ company.vat }/logo/vector` as MinioBase,
        vectorLogoFile!,
        ctx.user,
      );

      if (!vectorLogo) {
        return {
          errors: [
            {
              field: "vectorLogo",
              message: "Something went wrong",
            },
          ],
        };
      }

      vectorLogoData = {
        connect: {
          id: vectorLogo.id,
        },
      };
    }

    let rasterLogoData;
    if (info.rasterLogo) {
      const rasterLogo = await ImageService.uploadImage(
        `company/${ company.vat }/logo/raster` as ImageBase,
        rasterLogoFile!,
        ctx.user,
      );

      if (!rasterLogo) {
        return {
          errors: [
            {
              field: "rasterLogo",
              message: "Something went wrong",
            },
          ],
        };
      }

      rasterLogoData = {
        connect: {
          id: rasterLogo.id,
        },
      };
    }

    const entity = await ctx.prisma.company.update({
      data: {
        ...omit(
          [
            "vat",
          ],
          info,
        ),
        industry: {
          connect: {
            id: industry.id,
          },
        },
        rasterLogo: rasterLogoData,
        vectorLogo: vectorLogoData,
      },
      where: {
        vat: info.vat,
      },
      include: {
        industry: true,
      },
    });

    if (entity) {
      void EventsService.logEvent("company:update", ctx.user.id, { vat: entity.vat });
    }

    return {
      entity,
    };
  }

  @Mutation(() => String, { nullable: true })
  async addCompanyMember(
    @Ctx() ctx: Context,
      @Arg("email", () => String) newMemberEmail: string,
  ): GQLResponse<string, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const [ company ] = ctx.user.companies;

    if (!company && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return "You can not edit the company";
    }

    const companyUid = company.uid;

    const error = await ctx.prisma.$transaction(async (prisma) => {
      const newMember = await prisma.user.findFirst({
        where: {
          email: newMemberEmail,
        },
      });

      if (!newMember) {
        throw new Error("User does not exist");
      }

      return prisma.company.update({
        data: {
          members: {
            connect: {
              email: newMemberEmail,
            },
          },
        },
        where: {
          uid: companyUid,
        },
        select: {
          id: true,
        },
      }).catch(() => null);
    }).then(() => "").catch((e) => (e as Error)?.message);

    if (error) {
      return error;
    }

    void EventsService.logEvent("user:company:members:add", ctx.user.id, {
      email: newMemberEmail,
    });

    return "";
  }

  @Mutation(() => String, { nullable: true })
  async removeCompanyMember(
    @Ctx() ctx: Context,
      @Arg("email", () => String) newMemberEmail: string,
  ): GQLResponse<string, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const [ company ] = ctx.user.companies;

    if (!company && !hasAtLeastRole(Role.Admin, ctx.user)) {
      return "You can not edit the company";
    }

    const companyUid = company.uid;

    const entity = await ctx.prisma.company.update({
      data: {
        members: {
          disconnect: {
            email: newMemberEmail,
          },
        },
      },
      where: {
        uid: companyUid,
      },
      select: {
        id: true,
      },
    }).catch(() => null);

    if (!entity) {
      return "Company not found";
    }

    void EventsService.logEvent("user:company:members:remove", ctx.user.id, {
      email: newMemberEmail,
    });

    return "";
  }
}

@Resolver(() => Company)
export class CompanyListResolver {
  @Query(() => [ Company ])
  companies(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Args() args: FindManyCompanyArgs,
  ): GQLResponse<Company[]> {
    if (!ctx.user) {
      return Promise.resolve([]);
    }

    return ctx.prisma.company.findMany({
      ...args,
      cursor: undefined,
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => [ Company ])
  participants(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyParticipantsArgs,
  ) {
    const now = new Date();

    const seasonUid = args.season;

    const applicationsForSeasonWhere: Prisma.SeasonWhereInput =
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
        }
    ;

    const where: Prisma.CompanyWhereInput = {
      applications: {
        some: {
          forSeason: applicationsForSeasonWhere,
          approval: {
            OR: [
              {
                booth: true,
              },
              {
                panel: true,
              },
              {
                cocktail: true,
              },
              {
                talkParticipants: {
                  gt: 0,
                },
              },
              {
                workshopParticipants: {
                  gt: 0,
                },
              },
            ],
          },
        },
      },
    };

    const select_ = <T extends Prisma.CompanySelect>(x: T) => x;
    const select = select_({
      ...toSelect<Prisma.CompanySelect>(info, transformSelect),
      brandName: true,
    });

    if (select.applications) {
      const applications = select.applications as Exclude<typeof select.applications, boolean>;
      applications.where = {
        forSeason: applicationsForSeasonWhere,
      };
    }

    return ctx.prisma.company.findMany({
      ...omit([ "season", "cursor" ], args),
      where,
      select,
      orderBy: {
        brandName: "asc",
      },
    }).then((x) => x.sort((a, b) => a.brandName.localeCompare(b.brandName)));
  }

  @Query(() => Company, { nullable: true })
  company(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Arg("vat") vat: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (
      !ctx.user.companies.some((company) => company.vat === vat)
      && !hasAtLeastRole(Role.Admin, ctx.user)
    ) {
      return null;
    }

    return ctx.prisma.company.findUnique({
      where: {
        vat,
      },

      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => Company, { nullable: true })
  async companyInfo(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("uid") uid: string,
  ): GQLResponse<Company, "nullable"> {
    const select = toSelect<Prisma.CompanySelect>(info, transformSelect);

    const hasMembers = Boolean(select.members);
    const hasVat = Boolean(select.vat);

    if (select.applications) {
      const applications = select.applications as Exclude<typeof select.applications, boolean>;
      applications.where = {
        forSeason: {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        },
      };
    }

    delete select.members;
    delete select.vat;

    const company = await ctx.prisma.company.findUnique({
      where: {
        uid,
      },
      select,
    }) as Company | null;

    if (!company) {
      return company;
    }

    if (hasMembers) {
      company.members = [];
    }

    if (hasVat) {
      company.vat = "";
    }

    return company;
  }
}

@Resolver(() => Company)
export class AdminCompanyInfoMutationsResolver {
  @Mutation(() => CreateCompanyResponse, { nullable: true })
  async updateCompanyMembersFor(
    @Ctx() ctx: Context,
      @Arg("company") companyUid: string,
      @Arg("members", () => [ String ]) newMembers: string[],
  ): Promise<CreateCompanyResponse | null> {
    if (!ctx.user) {
      return null;
    }

    const [ company ] = ctx.user.companies;
    const isInCompany = company && company.uid === companyUid;

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

    type Members = { members: { uid: string, }[], };
    let oldCompany: Members | null = null;
    const entity = await ctx.prisma.$transaction(async (prisma) => {
      oldCompany = await prisma.company.findUnique({
        where: {
          uid: companyUid,
        },
        select: {
          members: {
            select: {
              uid: true,
            },
          },
        },
      });

      if (!oldCompany) {
        return null;
      }

      return prisma.company.update({
        data: {
          members: {
            disconnect: oldCompany.members.map(({ uid }) => ({
              uid,
            })),
            connect: newMembers.map((uid) => ({
              uid,
            })),
          },
        },
        where: {
          uid: companyUid,
        },
        include: {
          industry: true,
          members: true,
        },
      });
    });

    if (!entity || !oldCompany) {
      return {
        errors: [
          {
            field: "entity",
            message: "Company not found",
          },
        ],
      };
    }

    void EventsService.logEvent("admin:company:members:update", ctx.user.id, {
      old: (oldCompany as Members).members.map(({ uid }) => uid),
      new: newMembers,
    });

    return {
      entity,
    };
  }
}
