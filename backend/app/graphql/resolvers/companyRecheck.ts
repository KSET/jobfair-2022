import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";
import {
  CompanyRecheckService,
} from "../../services/company-recheck-service";

@ObjectType()
export class CompanyRecheckResult {
  @Field()
    uid: string = "";

  @Field()
    vat: string = "";

  @Field()
    brandName: string = "";

  @Field()
    status: string = "";

  @Field()
    storedLegalName: string = "";

  @Field()
    storedAddress: string = "";

  @Field(() => String, { nullable: true })
    apiLegalName: string | null = null;

  @Field(() => String, { nullable: true })
    apiAddress: string | null = null;

  @Field()
    legalNameChanged: boolean = false;

  @Field()
    addressChanged: boolean = false;

  @Field(() => String, { nullable: true })
    error: string | null = null;
}

@InputType()
export class CompanyRecheckApplyInput {
  @Field()
    uid: string = "";

  @Field(() => String, { nullable: true })
    legalName: string | null = null;

  @Field(() => String, { nullable: true })
    address: string | null = null;

  @Field()
    storedLegalName: string = "";

  @Field()
    storedAddress: string = "";
}

@ObjectType()
export class CompanyRecheckApplyResult {
  @Field()
    uid: string = "";

  @Field()
    updated: boolean = false;

  @Field(() => String, { nullable: true })
    error: string | null = null;
}

@Resolver()
export class CompanyRecheckResolver {
  @Query(() => [ CompanyRecheckResult ])
  recheckCompaniesVatData(
    @Ctx() ctx: Context,
      @Arg("uids", () => [ String ]) uids: string[],
  ): Promise<CompanyRecheckResult[]> {
    if (!ctx.user || !hasAtLeastRole(Role.Admin, ctx.user)) {
      return Promise.resolve([]);
    }

    return CompanyRecheckService.recheck(uids);
  }

  @Mutation(() => [ CompanyRecheckApplyResult ])
  async applyCompaniesVatData(
    @Ctx() ctx: Context,
      @Arg("updates", () => [ CompanyRecheckApplyInput ]) updates: CompanyRecheckApplyInput[],
  ): Promise<CompanyRecheckApplyResult[]> {
    if (!ctx.user || !hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    const results = await CompanyRecheckService.apply(updates);

    const changes = results
      .filter(({ updated }) => updated)
      .map(({ uid, changes }) => ({ uid, ...changes }))
    ;

    if (changes.length) {
      void EventsService.logEvent("admin:company:vat-recheck:apply", ctx.user.id, { changes });
    }

    return results.map(({ uid, updated, error }) => ({ uid, updated, error }));
  }
}
