import {
  FindManySeasonArgs,
  Season,
  CompanyApplication,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
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
  GraphQLResolveInfo,
} from "graphql";
import {
  omit,
} from "rambdax";
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
