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
  Prisma,
} from "@prisma/client";
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

  @FieldResolver(() => Number)
  async reservation(
    @Root() application: CompanyPanel,
      @Ctx() ctx: Context,
  ): Promise<GQLField<number>> {
    const { user } = ctx;

    if (!user) {
      return 0;
    }

    const reservation = await ctx.prisma.eventReservation.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        eventId_eventType_userId: {
          eventType: "panel",
          eventId: application.id!,
          userId: user.id,
        },
      },
    });

    return reservation?.status ?? 0;
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

  reservation(select) {
    select.id = true;

    delete select.reservation;

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
                forSeasonId: true,
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

      const createData: Prisma.CompanyPanelUpsertArgs["create"] = {
        name: input.name,
        description: input.description,
        companies: {
          connect:
            companies
              .map((c) => {
                const application = c.applications.find((a) => a.forSeasonId === season.id);

                if (!application) {
                  return null;
                }

                return {
                  id: application.id,
                };
              })
              .filter(Boolean)
          ,
        },
        forSeasonId: season.id,
      };

      const updateData: Prisma.CompanyPanelUpsertArgs["update"] = {
        ...createData,
        companies: {
          ...createData.companies,
          disconnect: oldPanel?.companies || [],
        },
      };

      return prisma.companyPanel.upsert({
        create: createData,
        update: updateData,
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
