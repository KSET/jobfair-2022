import {
  CalendarItem,
  ApplicationWorkshop,
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
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  mergeDeepRight,
  pick,
} from "rambdax";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  Role,
} from "../../helpers/auth";
import {
  transformSelect as transformSelectWorkshop,
} from "./companyApplicationWorkshop";

@Resolver(() => CalendarItem)
export class CalendarItemFieldResolver {
  @FieldResolver(() => Boolean)
  hasEvent(
    @Root() calendarItem: CalendarItem,
  ): GQLField<boolean> {
    return Boolean(
      calendarItem.forTalkId
      || calendarItem.forWorkshopId
      || calendarItem.forPanelId
      ,
    );
  }

  @FieldResolver(() => ApplicationWorkshop, { nullable: true })
  forWorkshop(
    @Root() calendarItem: CalendarItem,
  ): GQLField<ApplicationWorkshop, "nullable"> {
    return calendarItem.forWorkshop;
  }
}

@Resolver(() => CalendarItem)
export class CalendarItemDumbFieldResolver {
  @FieldResolver(() => String)
  title(
    @Root() calendarItem: CalendarItem,
  ): GQLField<string> {
    return (
      calendarItem.title
      || calendarItem.forTalk?.forApplication?.forCompany?.brandName
      || calendarItem.forWorkshop?.forApplication?.forCompany?.brandName
      || calendarItem.forPanel?.companies?.map((company) => company.forCompany?.brandName).filter((x) => x).join(", ")
      || ""
    );
  }

  @FieldResolver(() => String)
  text(
    @Root() calendarItem: CalendarItem,
  ): GQLField<string> {
    return (
      calendarItem.title
      || calendarItem.forTalk?.titleHr
      || calendarItem.forWorkshop?.titleHr
      || calendarItem.forPanel?.name
      || ""
    );
  }
}

export const transformSelect = transformSelectFor<CalendarItemFieldResolver>({
  hasEvent(select) {
    select.forTalkId = true;
    select.forWorkshopId = true;
    select.forPanelId = true;

    delete select.hasEvent;

    return select;
  },

  forWorkshop(select) {
    select.forWorkshop = {
      select: transformSelectWorkshop(select.forWorkshop as Dict),
    };

    return select;
  },
});

@InputType()
class CalendarUpdateInput {
  @Field(() => String, { nullable: true })
    uid?: string | undefined;

  @Field(() => String, { nullable: true })
    forUid?: string | undefined;

  @Field(() => Date)
    start: Date = new Date("2022-05-08T17:34:59.963Z");

  @Field(() => Date)
    end: Date = new Date("2022-05-08T17:34:59.963Z");

  @Field(() => String, { nullable: true })
    title?: string | undefined;

  @Field(() => String, { nullable: true })
    location?: string | undefined;

  @Field(() => String, { nullable: true })
    type?: string | undefined;

  @Field(() => String, { nullable: true })
    text?: string | undefined;

  @Field(() => Boolean, { nullable: true })
    grouped?: boolean | undefined;

  @Field(() => String)
    season: string = "";
}

@InputType()
class CalendarFilterInput {
  @Field(() => String, { nullable: true })
    type?: string | undefined;
}

@Resolver(() => CalendarItem)
export class CalendarItemInfoResolver {
  @Query(() => CalendarItem, { nullable: true })
  calendarItem(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<CalendarItem, "nullable"> {
    return ctx.prisma.calendarItem.findFirst({
      where: {
        uid,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Query(() => String, { nullable: true })
  async calendarItemCompanyUid(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
  ): GQLResponse<string, "nullable"> {
    const item = await ctx.prisma.calendarItem.findFirst({
      select: {
        forPanel: {
          select: {
            companies: {
              select: {
                forCompany: {
                  select: {
                    uid: true,
                  },
                },
              },
            },
          },
        },

        forTalk: {
          select: {
            forApplication: {
              select: {
                forCompany: {
                  select: {
                    uid: true,
                  },
                },
              },
            },
          },
        },

        forWorkshop: {
          select: {
            forApplication: {
              select: {
                forCompany: {
                  select: {
                    uid: true,
                  },
                },
              },
            },
          },
        },
      },

      where: {
        uid,
      },
    });

    return item?.forTalk?.forApplication.forCompany.uid || item?.forWorkshop?.forApplication.forCompany.uid || item?.forPanel?.companies?.[0].forCompany.uid;
  }

  @Query(() => [ CalendarItem ])
  calendar(
  @Ctx() ctx: Context,
    @Arg("season", () => String, { nullable: true }) season: string | undefined,
    @Arg("filter", () => CalendarFilterInput, { nullable: true }) filter: CalendarFilterInput | undefined,
    @Info() gqlInfo: GraphQLResolveInfo,
  ) {
    const now = new Date();

    const seasonFilter =
      season
        ? {
          forSeason: {
            uid: season,
          },
        }
        : {
          forSeason: {
            startsAt: {
              lte: now,
            },
            endsAt: {
              gte: now,
            },
          },
        }
    ;

    const select: Dict = mergeDeepRight(
      toSelect(gqlInfo, transformSelect),
      {
        forTalk: {
          select: {
            titleEn: true,
            titleHr: true,
            forApplication: {
              select: {
                forCompany: {
                  select: {
                    brandName: true,
                  },
                },
              },
            },
          },
        },
        forWorkshop: {
          select: {
            titleEn: true,
            titleHr: true,
            forApplication: {
              select: {
                forCompany: {
                  select: {
                    brandName: true,
                  },
                },
              },
            },
          },
        },
        forPanel: {
          select: {
            name: true,
            companies: {
              select: {
                forCompany: {
                  select: {
                    brandName: true,
                  },
                },
              },
            },
          },
        },
      },
    );

    console.log(select);

    return ctx.prisma.calendarItem.findMany({
      where: {
        ...seasonFilter,
        ...(
          filter?.type
            ? {
              type: filter.type,
            }
            : {}
        ),
      },
      select,
    });
  }
}

@Resolver(() => CalendarItem)
export class CalendarUpdateResolver {
  @Authorized(Role.Admin)
  @Mutation(() => CalendarItem, { nullable: true })
  updateCalendarItem(
    @Ctx() ctx: Context,
      @Arg("input", () => CalendarUpdateInput) input: CalendarUpdateInput,
      @Info() gqlInfo: GraphQLResolveInfo,
  ): GQLResponse<CalendarItem, "nullable"> {
    const { type } = input;

    const data = {
      ...pick([
        "title",
        "text",
        "location",
        "grouped",
        "start",
        "type",
        "end",
      ], input),
      forSeason: {
        connect: {
          uid: input.season,
        },
      },
    };

    switch (input.forUid ? type : null) {
      case "talk": {
        (data as Dict).forTalk = {
          connect: {
            uid: input.forUid!,
          },
        };

        break;
      }

      case "workshop": {
        (data as Dict).forWorkshop = {
          connect: {
            uid: input.forUid!,
          },
        };

        break;
      }

      case "panel": {
        (data as Dict).forPanel = {
          connect: {
            uid: input.forUid!,
          },
        };

        break;
      }
    }

    return ctx.prisma.calendarItem.upsert({
      update: data,
      create: data,
      where: {
        uid: input.uid || "",
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Authorized(Role.Admin)
  @Mutation(() => Boolean)
  deleteCalendarItem(
    @Ctx() ctx: Context,
      @Arg("uid", () => String) uid: string,
  ): GQLResponse<boolean> {
    return ctx.prisma.calendarItem.delete({
      where: {
        uid,
      },
    }).then(() => true).catch(() => false);
  }
}
