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
} from "@generated/type-graphql";
import {
  keys,
  reduce,
} from "rambdax";
import graphqlFields from "graphql-fields";
import {
  transformFields,
} from "@generated/type-graphql/helpers";
import {
  GraphQLResolveInfo,
} from "graphql";
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
  transformSelect as transformSelectUser,
} from "./user";

const selectTransform: Record<string, <T extends Record<string, unknown>>(select: T) => T> = {
  industry(select) {
    (select as Record<string, unknown>).industry = {
      select: select.industry,
    };

    return select;
  },

  members(select) {
    (select as Record<string, unknown>).usersCompanies = {
      select: {
        user: {
          select: transformSelectUser(select.members as Record<string, unknown>),
        },
      },
    };
    delete select.members;

    return select;
  },
};

export const transformSelect = <T extends Record<string, unknown>>(select: T): T => reduce(
  (acc, key) =>
    selectTransform[key as string]?.(acc) ?? acc
  ,
  select,
  keys(select),
);

@InputType()
class CreateCompanyInput extends CompanyCreateInput {
  @Field()
    industry: string = "";
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
  @FieldResolver((_type) => Industry, { nullable: true })
  industry(
  @Root() company: Company,
  ) {
    return company.industry;
  }

  @FieldResolver((_type) => [ User ])
  members(
  @Root() company: Company,
  ) {
    return company.usersCompanies?.map((uc) => uc.user) || [];
  }

  @Mutation(() => ValidateVatResponse)
  validateVat(
    @Ctx() ctx: Context,
      @Arg("vat") vat: string,
  ): Promise<ValidateVatResponse> {
    return CompanyService.validateVat(vat);
  }

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

    const create = await ctx.prisma.userCompany.create({
      data: {
        company: {
          create: {
            ...info,
            industry: {
              connect: {
                id: industry.id,
              },
            },
          },
        },
        user: {
          connect: {
            id: ctx.user.id,
          },
        },
      },
      select: {
        company: true,
      },
    });

    void EventsService.logEvent("company:register", ctx.user.id, { vat: create.company.vat });

    return {
      entity: create.company,
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

    const isInCompany = ctx.user.companies.some((company) => company.vat === info.vat);

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

    const create = await ctx.prisma.company.update({
      data: {
        ...info,
        industry: {
          connect: {
            id: industry.id,
          },
        },
      },
      where: {
        vat: info.vat,
      },
      include: {
        industry: true,
      },
    });

    void EventsService.logEvent("company:update", ctx.user.id, { vat: create.vat });

    return {
      entity: create,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const select = transformSelect(transformFields(graphqlFields(info)));

    return ctx.prisma.company.findMany({
      ...args,
      select,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const select = transformSelect(transformFields(graphqlFields(info)));

    return ctx.prisma.company.findUnique({
      where: {
        vat,
      },

      select,
    });
  }
}
