import {
  ApplicationWorkshop,
  ApplicationPresenter,
} from "@generated/type-graphql";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  MaybePromise,
  Mutation,
  ObjectType,
  Resolver,
  Root,
} from "type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  PresenterCreateInput,
} from "./companyPresenter";

@Resolver(() => ApplicationWorkshop)
export class CompanyApplicationWorkshopFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() application: ApplicationWorkshop,
  ): ApplicationPresenter[] {
    return application.presenters || [];
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationWorkshopFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: select.presenters,
    };

    return select;
  },
});

@ObjectType()
class CreateCompanyApplicationWorkshopResponse extends ValidationResponseFor(ApplicationWorkshop) {
}

@InputType()
export class WorkshopCreateInput {
  @Field()
    titleEn: string = "";

  @Field()
    titleHr: string = "";

  @Field()
    descriptionEn: string = "";

  @Field()
    descriptionHr: string = "";

  @Field()
    notesEn: string = "";

  @Field()
    notesHr: string = "";

  @Field()
    goal: string = "";

  @Field()
    language: string = "";

  @Field(() => PresenterCreateInput)
    presenter: PresenterCreateInput = null as unknown as PresenterCreateInput;
}

@Resolver(() => ApplicationWorkshop)
export class CompanyApplicationWorkshopCreateResolver {
  @Mutation(() => CreateCompanyApplicationWorkshopResponse, { nullable: true })
  createCompanyApplicationWorkshop(
    @Ctx() ctx: Context,
      @Arg("vat") vat: string,
      @Arg("info", () => WorkshopCreateInput, { nullable: true }) info: WorkshopCreateInput | null,
  ): MaybePromise<CreateCompanyApplicationWorkshopResponse | null> {
    console.log({
      info,
    });

    return null;
  }
}
