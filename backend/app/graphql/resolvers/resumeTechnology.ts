import {
  Arg,
  Ctx,
  Int,
  Query,
  Resolver,
} from "type-graphql";
import {
  ResumeTechnology,
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

@Resolver(() => ResumeTechnology)
export class ResumeTechnologyFieldResolver {
}

export const transformSelect = transformSelectFor<ResumeTechnologyFieldResolver>({});

@Resolver((_of) => ResumeTechnology)
export class ResumeTechnologyResolver {
  @Query((_type) => SearchResponseStringArray)
  async resumeTechnologies(
    @Ctx() ctx: Context,
      @Arg("query") query: string,
      @Arg("index", () => Int, { nullable: true }) index: number = 0,
  ): GQLResponse<SearchResponseStringArray> {
    const results = await ctx.prisma.resumeTechnology.findMany({
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
