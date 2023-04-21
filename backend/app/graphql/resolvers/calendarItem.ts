import {
  CalendarItem,
  ApplicationWorkshop,
  ApplicationTalk,
  CompanyPanel,
  Company,
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
  set,
} from "lodash";
import {
  type Prisma,
} from "@prisma/client";
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
import {
  transformSelect as transformSelectTalk,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectPanel,
} from "./companyPanel";
import {
  transformSelect as transformSelectCompany,
} from "./company";

const firstDefinedAsArray = <T>(args: (T | T[] | null | undefined)[]): T[] => {
  for (const arg of args) {
    if (null === arg || undefined === arg) {
      continue;
    }

    if (Array.isArray(arg)) {
      return arg;
    } else {
      return [ arg ];
    }
  }

  return [];
};

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

  @FieldResolver(() => ApplicationTalk, { nullable: true })
  forTalk(
    @Root() calendarItem: CalendarItem,
  ): GQLField<ApplicationTalk, "nullable"> {
    return calendarItem.forTalk;
  }

  @FieldResolver(() => CompanyPanel, { nullable: true })
  forPanel(
    @Root() calendarItem: CalendarItem,
  ): GQLField<CompanyPanel, "nullable"> {
    return calendarItem.forPanel;
  }

  @FieldResolver(() => [ Company ], { nullable: true })
  companies(
    @Root() calendarItem: CalendarItem,
  ): GQLField<Company[], "nullable"> {
    return firstDefinedAsArray([
      calendarItem.forTalk?.forApplication?.forCompany,
      calendarItem.forWorkshop?.forApplication?.forCompany,
      calendarItem.forPanel?.companies?.map((company) => company.forCompany).filter(Boolean),
    ]);
  }

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

const forItemSelect = <TEntryName extends string>(entryName: TEntryName, transformer: () => ((x: Dict) => Dict)) => {
  return (select: Dict) => {
    const transformed = transformer()(select[entryName] as Dict);
    if ("select" in transformed) {
      const subSelect = transformed.select;
      delete transformed.select;
      Object.assign(transformed, subSelect);
    }

    select[entryName] = {
      select: transformed,
    };

    return select;
  };
};

export const transformSelect = transformSelectFor<CalendarItemFieldResolver>({
  title(select) {
    const data: Prisma.CalendarItemSelect = {
      forTalk: {
        select: {
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
    };

    return mergeDeepRight(select, data);
  },

  text(select) {
    const data: Prisma.CalendarItemSelect = {
      forTalk: {
        select: {
          titleEn: true,
          titleHr: true,
        },
      },
      forWorkshop: {
        select: {
          titleEn: true,
          titleHr: true,
        },
      },
      forPanel: {
        select: {
          name: true,
        },
      },
    };

    return mergeDeepRight(select, data);
  },

  hasEvent(select) {
    select.forTalkId = true;
    select.forWorkshopId = true;
    select.forPanelId = true;

    delete select.hasEvent;

    return select;
  },

  forWorkshop: forItemSelect("forWorkshop", () => transformSelectWorkshop),

  forTalk: forItemSelect("forTalk", () => transformSelectTalk),

  forPanel: forItemSelect("forPanel", () => transformSelectPanel),

  companies(select) {
    const transformed = transformSelectCompany(select.companies as Dict);

    select = set(select, "forTalk.select.forApplication.select.forCompany.select", transformed);
    select = set(select, "forWorkshop.select.forApplication.select.forCompany.select", transformed);
    select = set(select, "forPanel.select.companies.select.forCompany.select", transformed);

    delete select.companies;

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

    return item?.forTalk?.forApplication.forCompany.uid || item?.forWorkshop?.forApplication.forCompany.uid || item?.forPanel?.companies?.find((x) => x.forCompany.uid)?.forCompany.uid;
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

    const select = toSelect(gqlInfo, transformSelect);

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
    if (input.start > input.end) {
      throw new Error("Start date must be before end date");
    }

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
