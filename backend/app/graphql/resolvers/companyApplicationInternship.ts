import { ApplicationInternship, FindManyApplicationInternshipArgs } from "@generated/type-graphql";
import {
  Args,
  Ctx,
  Field,
  Info,
  InputType,
  Query,
  Resolver,
} from "type-graphql";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { GraphQLResolveInfo } from "graphql";
import { Context } from "../../types/apollo-context";


@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipFieldResolver {
}
export const transformSelect = transformSelectFor<CompanyApplicationInternshipFieldResolver>({});


@Resolver(() => ApplicationInternship)
export class CompanyApplicationInternshipFindResolver {
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
            // ...(
            //   args.where
            //     ? args.where
            //     : {
            //       forSeason: {
            //         startsAt: {
            //           lte: now,
            //         },
            //         endsAt: {
            //           gte: now,
            //         },
            //       },
            //     }
            // ),
          },
          select: toSelect(info, transformSelect),
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

  @Field()
    workingPeriod: string = "";

  @Field()
    duration: string = "";
}



