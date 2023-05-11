import {
  FindManySeasonArgs,
  Season,
  CompanyApplication,
  CompanyPanel,
  CalendarItem,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  groupBy,
  map,
  omit,
  piped,
  toPairs,
  values,
} from "rambdax";
import {
  Prisma,
} from "@prisma/client";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  Dict,
  GQLField,
} from "../../types/helpers";
import {
  transformSelect as transformSelectCompany,
} from "./company";
import {
  transformSelect as transformSelectTalk,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectWorkshop,
} from "./companyApplicationWorkshop";
import {
  transformSelect as transformSelectPresenter,
} from "./companyPresenter";
import {
  transformSelect as transformSelectApproval,
} from "./companyApplicationApproval";
import {
  transformSelect as transformSelectPanel,
} from "./companyPanel";
import {
  transformSelect as transformSelectCalendarItem,
} from "./calendarItem";

@ObjectType()
export class ReservationItem {
  @Field(() => String)
    type: string = "";

  @Field(() => String)
    uid: string = "";

  @Field(() => Number)
    count: number = 0;
}

@Resolver(() => Season)
export class SeasonFieldResolver {
  @FieldResolver(() => [ CompanyApplication ])
  applications(
    @Ctx() ctx: Context,
      @Root() season: Season,
  ): CompanyApplication[] {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return season.companies || [];
  }

  @FieldResolver(() => CompanyPanel, { nullable: true })
  panel(
    @Root() season: Season,
  ): GQLField<CompanyPanel, "nullable"> {
    return season.panel || null;
  }

  @FieldResolver(() => [ CalendarItem ])
  calendar(
    @Root() season: Season,
  ): GQLField<CalendarItem[]> {
    return season.calendar || [];
  }

  @FieldResolver(() => [ ReservationItem ])
  async reservations(
    @Root() season: Season,
      @Ctx() ctx: Context,
  ): Promise<GQLField<ReservationItem[]>> {
    const info = await ctx.prisma.companyApplication.findMany({
      where: {
        forSeasonId: season.id,
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
      select: {
        workshop: {
          select: {
            id: true,
            uid: true,
          },
        },
        panel: {
          select: {
            id: true,
            uid: true,
          },
        },
        talk: {
          select: {
            id: true,
            uid: true,
          },
        },
      },
    });

    const infoFlat =
      info
        .flatMap((company) => [
          [ "workshop", company.workshop! ],
          [ "panel", company.panel! ],
          [ "talk", company.talk! ],
        ] as const)
        .filter((x) => x[1])
      ;

    type InfoEntry = (typeof infoFlat)[number];
    type InfoEntryType = InfoEntry[0];
    type InfoEntryValue = InfoEntry[1];

    const eventToUid2 = groupBy((x) => x[0], infoFlat);

    const eventToUid = {} as Record<InfoEntryType, Record<InfoEntryValue["id"], string>>;
    for (const item of toPairs(eventToUid2)) {
      const [ eventType, entries ] = item;

      if (!(eventType in eventToUid)) {
        eventToUid[eventType as InfoEntryType] = {};
      }

      for (const [ eventType, entry ] of entries) {
        if (!entry?.id) {
          continue;
        }

        eventToUid[eventType][entry.id] = entry.uid;
      }
    }

    const eventIds = info?.flatMap((company) => piped(
      company,
      values,
      map((x) => x?.id as number),
    )).filter((x) => x) || [];

    type Row = { eventId: InfoEntryValue["id"], eventType: InfoEntryType, status: number, count: bigint | number, };
    const items = await ctx.prisma.$queryRaw<Row[]>`
      select
        "eventId", "eventType", "status", count("status")
      from
        "EventReservation"
      where
        "status" <> 0 and "eventId" in (${ Prisma.join(eventIds) }) 
      group by
        "eventId", "eventType", "status"
    `;

    return items.map((row) => ({
      type: row.eventType,
      uid: eventToUid[row.eventType][row.eventId],
      count: Number(row.count),
    })).filter((x) => x.uid);
  }

  @FieldResolver(() => Int)
  entryCount(
    @Root() season: Season,
      @Ctx() ctx: Context,
  ): GQLField<number> {
    if (!ctx.user) {
      return 0;
    }

    return ctx.prisma.entryResumeLog.count({
      where: {
        seasonId: season.id,
      },
    });
  }

  @FieldResolver(() => Int)
  companyScannedCvs(
    @Root() season: Season,
      @Ctx() ctx: Context,
  ): GQLField<number> {
    if (!ctx.user) {
      return 0;
    }

    return ctx.prisma.scannedResume.count({
      where: {
        seasonId: season.id,
      },
    });
  }
}

export const transformSelect = transformSelectFor<SeasonFieldResolver>({
  applications(select) {
    const applications = select.applications as Dict;

    const transformCompanyField =
      (
        name: keyof CompanyApplication,
        transformer: (arg: Dict) => Dict,
      ) => {
        const field = applications[name] as Dict | null;
        if (!field) {
          return;
        }

        (select.companies as Dict<Dict>).select[name] = {
          select: transformer(field),
        };
      }
    ;

    select.companies = {
      select: transformSelectCompany(applications),
    };

    transformCompanyField("forCompany", transformSelectCompany);
    transformCompanyField("talk", transformSelectTalk);
    transformCompanyField("workshop", transformSelectWorkshop);
    transformCompanyField("forSeason", transformSelect);
    transformCompanyField("panelParticipants", transformSelectPresenter);
    transformCompanyField("approval", transformSelectApproval);

    delete select.applications;

    return select;
  },

  panel(select) {
    select.panel = {
      select: transformSelectPanel(select.panel as Dict),
    };

    return select;
  },

  calendar(select) {
    select.calendar = {
      select: transformSelectCalendarItem(select.calendar as Dict),
    };

    return select;
  },

  reservations(select) {
    select.id = true;
    delete select.reservations;

    return select;
  },

  entryCount(select) {
    select.id = true;
    delete select.entryCount;

    return select;
  },

  companyScannedCvs(select) {
    select.id = true;
    delete select.companyScannedCvs;

    return select;
  },
});

@InputType()
export class SeasonCreateInput {
  @Field()
    name: string = "";

  @Field()
    startsAt: Date = null as unknown as Date;

  @Field()
    endsAt: Date = null as unknown as Date;

  @Field()
    applicationsFrom: Date = null as unknown as Date;

  @Field()
    applicationsUntil: Date = null as unknown as Date;

  @Field()
    applicationsEditableFrom: Date = null as unknown as Date;

  @Field()
    applicationsEditableUntil: Date = null as unknown as Date;

  @Field()
    showParticipantsFrom: Date = null as unknown as Date;

  @Field()
    showParticipantsUntil: Date = null as unknown as Date;

  @Field()
    showPartnersFrom: Date = null as unknown as Date;

  @Field()
    showPartnersUntil: Date = null as unknown as Date;

  @Field()
    showSponsorsFrom: Date = null as unknown as Date;

  @Field()
    showSponsorsUntil: Date = null as unknown as Date;

  @Field()
    eventFrom: Date = null as unknown as Date;

  @Field()
    eventUntil: Date = null as unknown as Date;

  @Field()
    feedbackFrom: Date = null as unknown as Date;

  @Field()
    feedbackUntil: Date = null as unknown as Date;

  @Field()
    scheduleFrom: Date = null as unknown as Date;

  @Field()
    scheduleUntil: Date = null as unknown as Date;
}

@InputType()
export class SeasonUpdateInput extends SeasonCreateInput {
  @Field()
    uid: string = "";
}

@Resolver(() => Season)
export class SeasonCreateResolver {
  @Mutation(() => Season, { nullable: true })
  createSeason(
  @Ctx() ctx: Context,
    @Arg("info") info: SeasonCreateInput,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.create({
      data: info,
    });
  }

  @Mutation(() => Season, { nullable: true })
  updateSeason(
  @Ctx() ctx: Context,
    @Arg("info") info: SeasonUpdateInput,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.update({
      where: {
        uid: info.uid,
      },
      data: {
        ...omit(
          [
            "uid",
          ],
          info,
        ),
      },
    });
  }

  @Mutation(() => Season, { nullable: true })
  deleteSeason(
  @Ctx() ctx: Context,
    @Arg("uid") uid: string,
  ) {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.season.delete({
      where: {
        uid,
      },
    });
  }
}

@Resolver(() => Season)
export class SeasonFindResolver {
  @Query(() => [ Season ])
  seasons(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManySeasonArgs,
  ) {
    return ctx.prisma.season.findMany({
      ...args,
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => Season, { nullable: true })
  currentSeason(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    const now = new Date();

    return ctx.prisma.season.findFirst({
      where: {
        startsAt: {
          lte: now,
        },
        endsAt: {
          gte: now,
        },
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Query(() => Season, { nullable: true })
  season(
  @Ctx() ctx: Context,
    @Arg("uid") uid: string,
    @Info() info: GraphQLResolveInfo,
  ) {
    return ctx.prisma.season.findFirst({
      where: {
        uid,
      },
      select: toSelect(info, transformSelect),
    });
  }
}
