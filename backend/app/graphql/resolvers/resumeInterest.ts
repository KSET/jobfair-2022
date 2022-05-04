import {
  Arg,
  Ctx,
  Query,
  Resolver,
  Int,
} from "type-graphql";
import {
  ResumeInterest,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  GQLResponse,
} from "../../types/helpers";
import {
  SearchResponseStringArray,
} from "../helpers/search";

@Resolver(() => ResumeInterest)
export class ResumeInterestFieldResolver {
}

export const transformSelect = transformSelectFor<ResumeInterestFieldResolver>({});

@Resolver((_of) => ResumeInterest)
export class ResumeInterestResolver {
  @Query(() => SearchResponseStringArray)
  async resumeInterests(
    @Ctx() ctx: Context,
      @Arg("query") query: string,
      @Arg("index", () => Int, { nullable: true }) index: number = 0,
  ): GQLResponse<SearchResponseStringArray> {
    const results = await ctx.prisma.resumeInterest.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
      },
      take: 10,
    });

    const names = results.map((result) => result.name);
    names.push(query);

    return ({
      index,
      entities: Array.from(new Set(names)),
    });
  }
}
