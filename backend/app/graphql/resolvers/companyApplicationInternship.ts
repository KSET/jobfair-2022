import { ApplicationInternship, Company, CompanyApplication, FindManyApplicationInternshipArgs } from "@generated/type-graphql";
import {
  Args,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { GraphQLResolveInfo } from "graphql";
import { Context } from "../../types/apollo-context";
import {
  transformSelect as transformSelectImage,
} from "./image";
import { Dict } from "../../types/helpers";


@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipFieldResolver {
  @Field(() => CompanyApplication)
  @FieldResolver(() => Company, { nullable: true })
  company(
    @Root() internship: ApplicationInternship,
  ): Company | null {
    return internship.forApplication?.forCompany ?? null;
  }
}
export const transformSelect = transformSelectFor<CompanyApplicationInternshipFieldResolver>({
  company(select) {

    const rasterLogoSelection = (
      (select as Dict)?.company as Dict
    )?.rasterLogo as Dict;
  
    select.forApplication = {
      select: {
        forCompany: {
          select: {
            uid: true,
            brandName: true,
            rasterLogo: {
              select: transformSelectImage(rasterLogoSelection),
            },
          },
        },
      },
    };
  
    delete select.company;
    return select;
  }
});



@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipResolver {
  @Query(() => [ ApplicationInternship ])
  internships(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationInternshipArgs,
  ) {
    const now = new Date();

    return ctx.prisma.applicationInternship.findMany({
          ...args,
          cursor: undefined,
          where: {
            ...(
              args.where
                ? args.where
                : { 
                  forApplication: {
                  forSeason: {
                    startsAt: {
                      lte: now,
                    },
                    endsAt: {
                      gte: now,
                    },
                  }
                }
              }
            )
          },
          select: toSelect(info, transformSelect),
          orderBy: {
            forApplication: {
              forCompany: {
                brandName: "asc",
              },
            },
          },
    })
  }
}


@InputType()
export class InternshipCreateInput {
  @Field()
    position: string = "";

  @Field()
    competencies: string = "";

  @Field()
    description: string = "";

  @Field(() => Date)
    workingPeriodStart: Date = new Date("2022-05-03T17:26:50.810Z");

  @Field(() => Date)
    workingPeriodEnd: Date = new Date("2022-05-03T17:26:50.810Z");

  @Field()
    duration: string = "";

  @Field()
    url: string = "";
}



