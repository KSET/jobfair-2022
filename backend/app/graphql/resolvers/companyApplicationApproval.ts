import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  CompanyApplication,
  CompanyApplicationApproval,
} from "@generated/type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Dict,
} from "../../types/helpers";
import {
  Context,
} from "../../types/apollo-context";
import {
  Role,
} from "../../helpers/auth";
import {
  transformSelect as transformSelectApplication,
} from "./companyApplication";

@Resolver(() => CompanyApplicationApproval)
export class CompanyApplicationApprovalFieldResolver {
  @FieldResolver(() => CompanyApplication)
  forApplication(
    @Root() approval: CompanyApplicationApproval,
  ): CompanyApplication | null {
    return approval.forApplication || null;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationApprovalFieldResolver>({
  forApplication(select) {
    select.forApplication = {
      select: transformSelectApplication(select.forApplication as Dict),
    };

    return select;
  },
});

@InputType()
class ApproveCompanyApplicationsInputParts {
  @Field()
    booth: boolean = false;

  @Field()
    cocktail: boolean = false;

  @Field()
    panel: boolean = false;

  @Field()
    quest: boolean = false;

  @Field()
    talkParticipants: number = 0;

  @Field()
    workshopParticipants: number = 0;

  @Field()
    logoHidden: boolean = false;
}

@InputType()
class ApproveCompanyApplicationsInput {
  @Field()
    uid: string = "";

  @Field(() => ApproveCompanyApplicationsInputParts)
    parts: ApproveCompanyApplicationsInputParts = null as unknown as ApproveCompanyApplicationsInputParts;
}

@Resolver(() => CompanyApplicationApproval)
export class CompanyApplicationApprovalAdminResolver {
  @Query(() => [ CompanyApplicationApproval ])
  @Authorized(Role.Admin)
  approvedCompanyApplications(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    return ctx.prisma.companyApplicationApproval.findMany({
      select: toSelect(info, transformSelect),
    });
  }

  @Mutation(() => [ CompanyApplicationApproval ])
  @Authorized(Role.Admin)
  async approveCompanyApplications(
    @Ctx() ctx: Context,
      @Arg("season") seasonUid: string,
      @Arg("companies", () => [ ApproveCompanyApplicationsInput ]) inputs: ApproveCompanyApplicationsInput[],
  ): Promise<CompanyApplicationApproval[]> {
    const season = await ctx.prisma.season.findFirst({
      where: {
        uid: seasonUid,
      },
      select: {
        uid: true,
      },
    });

    if (!season) {
      return [];
    }

    return await ctx.prisma.$transaction(async (prisma) => {
      await prisma.companyApplicationApproval.deleteMany({
        where: {
          forApplication: {
            forSeason: {
              uid: seasonUid,
            },
          },
        },
      });

      const applications = await prisma.companyApplication.findMany({
        where: {
          forSeason: {
            uid: seasonUid,
          },
          forCompany: {
            uid: {
              in: inputs.map((input) => input.uid),
            },
          },
        },
        select: {
          id: true,
          forCompany: {
            select: {
              uid: true,
            },
          },
        },
      });

      const companyUidToApplicationId = Object.fromEntries(applications.map((application) => [ application.forCompany.uid, application.id ]));
      const data =
        inputs
          .filter((c) => c.uid in companyUidToApplicationId)
          .map((input) => ({
            ...input.parts,
            forApplicationId: companyUidToApplicationId[input.uid],
          }))
      ;

      await prisma.companyApplicationApproval.createMany({
        data,
      });

      return prisma.companyApplicationApproval.findMany({
        where: {
          forApplication: {
            forSeason: {
              uid: seasonUid,
            },
          },
        },
        include: {
          forApplication: {
            include: {
              forSeason: true,
              forCompany: true,
            },
          },
        },
      });
    });
  }
}
