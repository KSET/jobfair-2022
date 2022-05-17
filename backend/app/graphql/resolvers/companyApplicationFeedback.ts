import {
  CompanyApplicationFeedback,
  CompanyApplicationFeedbackCreateInput,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Mutation,
  Resolver,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  GQLResponse,
} from "../../types/helpers";
import {
  Context,
} from "../../types/apollo-context";

@Resolver(() => CompanyApplicationFeedback)
export class CompanyApplicationFeedbackFieldResolver {
}

export const transformSelect = transformSelectFor<CompanyApplicationFeedbackFieldResolver>({});


@Resolver(() => CompanyApplicationFeedback)
export class CompanyApplicationFeedbackMutationResolver {
  @Authorized()
  @Mutation(() => CompanyApplicationFeedback, { nullable: true })
  async updateCompanyApplicationFeedback(
    @Arg("input") input: CompanyApplicationFeedbackCreateInput,
      @Ctx() ctx: Context,
  ): GQLResponse<CompanyApplicationFeedback, "nullable"> {
    const user = ctx.user!;

    if (!user.companies.length) {
      return null;
    }

    const [ company ] = user.companies;

    const application = await ctx.prisma.companyApplication.findFirst({
      where: {
        forSeason: {
          startsAt: {
            lte: new Date(),
          },
          endsAt: {
            gte: new Date(),
          },
        },
        forCompany: {
          uid: company.uid,
        },
      },
      select: {
        id: true,
      },
    });

    if (!application) {
      return null;
    }

    console.log(application);

    return ctx.prisma.companyApplicationFeedback.upsert({
      create: {
        ...input,
        forApplicationId: application.id,
      },
      update: input,
      where: {
        forApplicationId: application.id,
      },
    });
  }
}
