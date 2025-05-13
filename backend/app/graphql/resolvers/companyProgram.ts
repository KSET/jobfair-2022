import {
  Field,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import {
  ApplicationTalk,
  ApplicationWorkshop,
  ApplicationPresenter,
  CompanyApplicationApproval,
  CompanyPanel,
  ApplicationCocktail,
  ApplicationInternship,
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
import {
  transformSelect as transformSelectPanel,
} from "./companyPanel";
import {
  transformSelect as transformSelectInternship,
} from "./companyApplicationInternship";

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

  @Field(() => [ ApplicationPresenter ])
    panelParticipants: ApplicationPresenter[] = [];

  @Field(() => CompanyPanel, { nullable: true })
    panel: CompanyPanel | null = null;

  @Field(() => ApplicationInternship, { nullable: true })
    internship: ApplicationInternship | null = null;

  approval: CompanyApplicationApproval | null = null;
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

  @FieldResolver(() => [ ApplicationPresenter ])
  panelParticipants(
    @Root() program: CompanyProgram,
  ): GQLField<ApplicationPresenter[]> {
    return approved(program?.panelParticipants, "panel", program) || [];
  }

  @FieldResolver(() => CompanyPanel, { nullable: true })
  panel(
    @Root() program: CompanyProgram,
  ): GQLField<CompanyPanel, "nullable"> {
    return approved(program?.panel, "panel", program);
  }

  @FieldResolver(() => ApplicationInternship, { nullable: true })
  internship(
    @Root() program: CompanyProgram,
  ): GQLField<ApplicationInternship, "nullable"> {
    return program?.internship ?? null;
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

  panelParticipants: withApplications((select) => {
    select.applications.select.panelParticipants = {
      select: transformSelectPresenter(select.panelParticipants as Dict),
    };
    select.applications.select.approval.select.panel = true;

    delete select.panelParticipants;
  }),

  panel: withApplications((select) => {
    select.applications.select.panel = {
      select: transformSelectPanel(select.panel as Dict),
    };
    select.applications.select.approval.select.panel = true;

    delete select.panel;
  }),

  internship: withApplications((select) => {
    select.applications.select.internship = {
      select: transformSelectInternship(select.internship as Dict),
    };
    
    delete select.internship;
  }),
  
});
