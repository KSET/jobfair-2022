import {
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import {
  ApplicationCocktail,
  ApplicationTalk,
  ApplicationWorkshop,
  ApplicationPresenter,
  CompanyApplicationApproval,
} from "@generated/type-graphql";
import {
  Dict,
  GQLField,
} from "../../types/helpers";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  transformSelect as transformSelectTalk,
} from "./companyApplicationTalk";
import {
  transformSelect as transformSelectWorkshop,
} from "./companyApplicationWorkshop";
import {
  transformSelect as transformSelectCocktail,
} from "./companyApplicationCocktail";
import {
  transformSelect as transformSelectPresenter,
} from "./companyPresenter";

@ObjectType()
export class CompanyProgramPanel {
  @Field(() => [ ApplicationPresenter ])
    companyPresenters: ApplicationPresenter[] = [];
}

@ObjectType()
export class CompanyProgram {
  @Field(() => String, { nullable: true })
    booth: string | null = null;

  @Field(() => ApplicationTalk, { nullable: true })
    talk: ApplicationTalk | null = null;

  @Field(() => ApplicationWorkshop, { nullable: true })
    workshop: ApplicationWorkshop | null = null;

  @Field(() => ApplicationCocktail, { nullable: true })
    cocktail: ApplicationCocktail | null = null;

  @Field(() => CompanyProgramPanel, { nullable: true })
    panel: CompanyProgramPanel | null = null;

  approval: CompanyApplicationApproval | null = null;

  panelParticipants: CompanyProgramPanel["companyPresenters"] = [];
}

const approved =
  <T>(
    val: T,
    key: keyof CompanyApplicationApproval,
    program: CompanyProgram,
  ): NonNullable<T> | null =>
    (
      program?.approval?.[key]
        ? val as NonNullable<T>
        : null
    ) ?? null
;

@Resolver(() => CompanyProgram)
export class CompanyProgramFieldResolver {
  @FieldResolver(() => String, { nullable: true })
  booth(
    @Root() program: CompanyProgram,
  ): GQLField<string, "nullable"> {
    return approved(program?.booth, "booth", program);
  }

  @FieldResolver(() => ApplicationTalk, { nullable: true })
  talk(
    @Root() program: CompanyProgram,
  ): GQLField<ApplicationTalk, "nullable"> {
    return approved(program?.talk, "talkParticipants", program);
  }

  @FieldResolver(() => ApplicationWorkshop, { nullable: true })
  workshop(
    @Root() program: CompanyProgram,
  ): GQLField<ApplicationWorkshop, "nullable"> {
    return approved(program?.workshop, "workshopParticipants", program);
  }

  @FieldResolver(() => ApplicationCocktail, { nullable: true })
  cocktail(
    @Root() program: CompanyProgram,
  ): GQLField<ApplicationCocktail, "nullable"> {
    return approved(program?.cocktail, "cocktail", program);
  }

  @FieldResolver(() => CompanyProgramPanel, { nullable: true })
  panel(
    @Root() program: CompanyProgram,
  ): GQLField<CompanyProgramPanel, "nullable"> {
    const resp = approved(program?.panelParticipants, "panel", program);

    if (resp?.length) {
      const panel = new CompanyProgramPanel();
      panel.companyPresenters = resp;
      return panel;
    } else {
      return null;
    }
  }
}

type WithApplications<T> = T & {
  applications: {
    select: Dict & {
      approval: {
        select: Dict,
      },
    },
  },
};

const ensureApplicationsSelect = <T extends Dict>(select: T) => {
  if (!select.applications) {
    (select as Dict).applications = {};
  }

  const applications = select.applications as Dict;

  if (!applications.select) {
    applications.select = {};
  }

  const applicationsSelect = applications.select as Dict;

  if (!applicationsSelect.approval) {
    applicationsSelect.approval = {};
  }

  const applicationsSelectApproval = applicationsSelect.approval as Dict;

  if (!applicationsSelectApproval.select) {
    applicationsSelectApproval.select = {};
  }

  return select as WithApplications<T>;
};

const withApplications =
  <T extends Dict>(transformer: (newSelect: WithApplications<T>) => T | void) =>
    (select: T) =>
      transformer(ensureApplicationsSelect(select)) || select
;

export const transformSelect = transformSelectFor<CompanyProgramFieldResolver>({
  booth: withApplications((select) => {
    select.applications.select.booth = true;
    select.applications.select.approval.select.booth = true;

    delete select.booth;
  }),

  talk: withApplications((select) => {
    select.applications.select.talk = {
      select: transformSelectTalk(select.talk as Dict),
    };
    select.applications.select.approval.select.talkParticipants = true;

    delete select.talk;
  }),

  workshop: withApplications((select) => {
    select.applications.select.workshop = {
      select: transformSelectWorkshop(select.workshop as Dict),
    };
    select.applications.select.approval.select.workshopParticipants = true;

    delete select.workshop;
  }),

  cocktail: withApplications((select) => {
    select.applications.select.cocktail = {
      select: transformSelectCocktail(select.cocktail as Dict),
    };
    select.applications.select.approval.select.cocktail = true;

    delete select.cocktail;
  }),

  panel: withApplications((select) => {
    select.applications.select.panelParticipants = {
      select: transformSelectPresenter((select.panel as Dict).companyPresenters as Dict),
    };
    select.applications.select.approval.select.panel = true;

    delete select.panel;
  }),
});
