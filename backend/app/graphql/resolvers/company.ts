import {
  Arg,
  Args,
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
  User,
  Company,
  CompanyCreateInput,
  FindManyCompanyArgs,
  Industry,
  Image,
  File,
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
  transformSelect as transformSelectMembers,
} from "./user";
import {
  transformSelect as transformSelectImage,
} from "./image";

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
      vectorLogoMimeTypes.has(file.mimetype.toLowerCase()) ||
      vectorLogoExtensions.some((ext) => file.filename.endsWith(ext))
    );
  },
};

@Resolver(() => Company)
export class CompanyFieldResolver {
  @FieldResolver((_type) => Industry, { nullable: true })
  industry(
  @Root() company: Company,
  ) {
    return company.industry;
  }

  @FieldResolver((_type) => [ User ], { nullable: true })
  members(
  @Root() company: Company,
  ) {
    return company.members;
  }

  @FieldResolver((_type) => Image, { nullable: true })
  rasterLogo(
    @Root() company: Company,
  ): Image | null {
    return company.rasterLogo || null;
  }

  @FieldResolver((_type) => File, { nullable: true })
  vectorLogo(
    @Root() company: Company,
  ): File | null {
    return company.vectorLogo || null;
  }
}

export const transformSelect = transformSelectFor<CompanyFieldResolver>({
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
  ): Promise<ValidateVatResponse> {
    return CompanyService.validateVat(vat);
  }
}

@Resolver(() => Company)
export class CompanyInfoMutationsResolver {
  @Mutation(() => CreateCompanyResponse, { nullable: true })
  async registerCompany(
    @Ctx() ctx: Context,
      @Arg("info", () => CreateCompanyInput) info: CreateCompanyInput,
  ): Promise<CreateCompanyResponse | null> {
    if (!ctx.user) {
      return null;
    }

    const validation = await CompanyValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    info.vat = info.vat.toUpperCase();

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
  ): Promise<CreateCompanyResponse | null> {
    if (!ctx.user) {
      return null;
    }

    const validation = await CompanyValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    info.vat = info.vat.toUpperCase();

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
}

@Resolver(() => Company)
export class CompanyListResolver {
  @Query(() => [ Company ])
  companies(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyCompanyArgs,
  ) {
    if (!ctx.user) {
      return [];
    }

    return ctx.prisma.company.findMany({
      ...args,
      select: toSelect(info, transformSelect),
    });
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
      !ctx.user.companies.some((company) => company.vat === vat) &&
      !hasAtLeastRole(Role.Admin, ctx.user)
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
}
