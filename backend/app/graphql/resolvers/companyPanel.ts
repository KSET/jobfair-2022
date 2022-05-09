import {
  CompanyPanel,
  Company,
  CalendarItem,
} from "@generated/type-graphql";
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Mutation,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  Role,
} from "../../helpers/auth";
import {
  Context,
} from "../../types/apollo-context";
import {
  transformSelect as transformSelectCompany,
} from "./company";
import {
  transformSelect as transformSelectCalendarItem,
} from "./calendarItem";

@Resolver(() => CompanyPanel)
export class CompanyPanelFieldResolver {
  @FieldResolver(() => [ Company ])
  companies(
    @Root() companyPanel: CompanyPanel,
  ): GQLField<Company[]> {
    return companyPanel.companies?.map((c) => c.forCompany!).filter((x) => x) || [];
  }

  @FieldResolver(() => CalendarItem, { nullable: true })
  event(
    @Root() companyPanel: CompanyPanel,
  ): GQLField<CalendarItem, "nullable"> {
    return companyPanel.event || null;
  }
}

export const transformSelect = transformSelectFor<CompanyPanelFieldResolver>({
  companies(select) {
    select.companies = {
      select: {
        forCompany: {
          select: transformSelectCompany(select.companies as Dict),
        },
      },
    };

    return select;
  },

  event(select) {
    select.event = {
      select: transformSelectCalendarItem(select.event as Dict),
    };

    return select;
  },
});


@InputType()
class CompanyPanelUpdateInput {
  @Field(() => String, { nullable: true })
    uid: string | null = null;

  @Field(() => String)
    name: string = "";

  @Field(() => String)
    description: string = "";

  @Field(() => String)
    season: string = "";

  @Field(() => [ String ])
    companies: string[] = [];
}

@Resolver(() => CompanyPanel)
export class CompanyPanelUpdateResolver {
  @Authorized(Role.Admin)
  @Mutation(() => CompanyPanel, { nullable: true })
  updateCompanyPanel(
    @Ctx() ctx: Context,
      @Arg("input", () => CompanyPanelUpdateInput) input: CompanyPanelUpdateInput,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<CompanyPanel, "nullable"> {
    return ctx.prisma.$transaction(async (prisma) => {
      const [
        companies,
        season,
        oldPanel,
      ] = await Promise.all([
        prisma.company.findMany({
          where: {
            uid: {
              in: input.companies,
            },
          },
          select: {
            applications: {
              select: {
                id: true,
              },
            },
          },
        }),
        prisma.season.findFirst({
          where: {
            uid: input.season,
          },
          select: {
            id: true,
          },
        }),
        prisma.companyPanel.findFirst({
          where: {
            uid: input.uid || "",
          },
          select: {
            companies: {
              select: {
                id: true,
              },
            },
          },
        }),
      ] as const);

      if (!season) {
        throw new Error("Season not found");
      }

      const data = {
        name: input.name,
        description: input.description,
        companies: {
          connect: companies.map((a) => a.applications?.[0]).filter((x) => x),
        },
        forSeasonId: season.id,
      };

      return prisma.companyPanel.upsert({
        create: data,
        update: {
          ...data,
          companies: {
            ...data.companies,
            disconnect: oldPanel?.companies || [],
          },
        },
        where: {
          uid: input.uid || "",
        },
        select: toSelect(gqlInfo, transformSelect),
      });
    });
  }

  @Authorized(Role.Admin)
  @Mutation(() => Boolean)
  deleteCompanyPanel(
    @Ctx() ctx: Context,
      @Arg("uid", () => String) uid: string,
  ): GQLResponse<boolean> {
    return ctx.prisma.companyPanel.delete({
      where: {
        uid,
      },
    }).then(() => true).catch(() => false);
  }
}
