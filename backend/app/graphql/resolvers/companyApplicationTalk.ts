import {
  ApplicationTalk,
  ApplicationPresenter,
} from "@generated/type-graphql";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  CompanyTalkValidation,
} from "../../services/validation-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  PresenterCreateInput,
} from "./companyPresenter";

@Resolver(() => ApplicationTalk)
export class CompanyApplicationTalkFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() application: ApplicationTalk,
  ): ApplicationPresenter[] {
    return application.presenters || [];
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationTalkFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: select.presenters,
    };

    return select;
  },
});


@ObjectType()
class CreateCompanyApplicationTalkResponse extends ValidationResponseFor(ApplicationTalk) {
}

@InputType()
export class TalkCreateInput {
  @Field()
    titleEn: string = "";

  @Field()
    titleHr: string = "";

  @Field()
    descriptionEn: string = "";

  @Field()
    descriptionHr: string = "";

  @Field()
    category: string = "";

  @Field()
    language: string = "";

  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}

@Resolver(() => ApplicationTalk)
export class CompanyApplicationTalkCreateResolver {
  @Mutation(() => CreateCompanyApplicationTalkResponse, { nullable: true })
  async createCompanyApplicationTalk(
    @Ctx() ctx: Context,
      @Arg("vat") vat_: string,
      @Arg("info", () => TalkCreateInput, { nullable: true }) info: TalkCreateInput | null,
  ): Promise<CreateCompanyApplicationTalkResponse | null> {
    if (!ctx.user) {
      return null;
    }

    const vat = vat_.toUpperCase();

    const isInCompany = ctx.user.companies.some((company) => company.vat === vat);

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

    const companyApplication = await ctx.prisma.companyApplication.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        forCompanyId_forSeasonId: {
          forCompanyId: 1,
          forSeasonId: 1,
        },
      },
      select: {
        talk: true,
      },
    });

    if (!companyApplication) {
      return {
        errors: [
          {
            field: "entity",
            message: "Company does not exist",
          },
        ],
      };
    }

    if (!info) {
      // const resp = await ctx.prisma.applicationTalkCategory.delete({
      //   where: {
      //     id: 0,
      //   },
      // });
      // console.log(resp);
      return null;
    }

    const validation = await CompanyTalkValidation(info);

    if (!validation.success) {
      return {
        errors: validation.errors,
      };
    }

    const validTalkCategory = await ctx.prisma.applicationTalkCategory.findUnique({
      where: {
        name: info?.category,
      },
      select: {
        id: true,
      },
    });

    if (!validTalkCategory) {
      return {
        errors: [
          {
            field: "category",
            message: "Invalid category",
          },
        ],
      };
    }

    return null;
  }
}
