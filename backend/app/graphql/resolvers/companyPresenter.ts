import {
  Field,
  FieldResolver,
  InputType,
  Resolver,
  Root,
} from "type-graphql";
import {
  FileUpload,
  GraphQLUpload,
} from "graphql-upload";
import {
  ApplicationPresenter,
  Company,
  Image,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  transformSelect as transformSelectPhoto,
} from "./image";
import {
  transformSelect as transformSelectCompany
} from "./company"
import { Dict } from "../../types/helpers";
import { set } from "lodash";

@Resolver(() => ApplicationPresenter)
export class CompanyApplicationPresenterFieldResolver {
  @FieldResolver(() => Image, { nullable: true })
  photo(
    @Root() presenter: ApplicationPresenter,
  ): Image | null {
    return presenter.photo || null;
  }
  
  @FieldResolver(() => Company, { nullable: true })
  company(
    @Root() presenter: ApplicationPresenter,
  ): Company | null {
    if( presenter.forPanels?.length && presenter.forPanels?.length > 0 && presenter.forPanels[0].forCompany) {
      return presenter.forPanels[0].forCompany!;
    }
    else if (presenter.forWorkshops?.length && presenter.forWorkshops?.length > 0 && presenter.forWorkshops[0].forApplication?.forCompany) {
      return presenter.forWorkshops[0].forApplication?.forCompany!;
    }
    else if (presenter.forTalks?.length && presenter.forTalks?.length > 0 && presenter.forTalks[0].forApplication?.forCompany) {
      return presenter.forTalks[0].forApplication?.forCompany!;
    }
    return null;
  }
}

export const transformSelect = transformSelectFor<CompanyApplicationPresenterFieldResolver>({
  photo(select) {
    select.photo = {
      select: transformSelectPhoto(select.photo as Record<string, unknown>),
    };

    return select;
  },
  company(select) {
    const transformed = transformSelectCompany(select.company as Dict);
    
    select = set(select, "forTalks.select.forApplication.select.forCompany.select", transformed);
    select = set(select, "forWorkshops.select.forApplication.select.forCompany.select", transformed);
    select = set(select, "forPanels.select.forCompany.select", transformed);

    delete select.company;

    return select;
  }
});

@InputType()
export class PresenterCreateInput {
  @Field()
    firstName: string = "";

  @Field()
    lastName: string = "";

  @Field()
    bioEn: string = "";

  @Field()
    bioHr: string = "";

  @Field(() => String, { nullable: true })
    type: string = "participant";

  @Field(() => GraphQLUpload, { nullable: true })
    photo: FileUpload | null = null;
}
