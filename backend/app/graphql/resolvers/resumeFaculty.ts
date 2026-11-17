import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  ResumeFaculty,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  type Context,
} from "../../types/apollo-context";
import {
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";
import {
  FACULTIES,
  isFaculty,
} from "../../shared/faculties";

@Resolver(() => ResumeFaculty)
export class ResumeFacultyFieldResolver {
}

@InputType()
export class ResumeFacultyCreateInput {
  @Field(() => String)
    name: string = "";

  @Field(() => String)
    module: string = "";
}

@ObjectType()
class UnmappedFaculty {
  @Field(() => String)
    name: string = "";

  @Field(() => Int)
    count: number = 0;
}

@Resolver()
export class ResumeFacultyMapperResolver {
  @Authorized(Role.Admin)
  @Query(() => [ UnmappedFaculty ])
  async unmappedFaculties(
    @Ctx() ctx: Context,
  ): Promise<UnmappedFaculty[]> {
    const groups = await ctx.prisma.resumeFaculty.groupBy({
      by: [ "name" ],
      where: {
        name: {
          notIn: [ ...FACULTIES ],
        },
      },
      _count: {
        _all: true,
      },
    });

    return (
      groups
        .filter(({ name }) => "" !== name.trim())
        .map(({ name, _count }) => ({ name, count: _count._all }))
        .sort((a, b) => b.count - a.count)
    );
  }

  @Authorized(Role.Admin)
  @Mutation(() => Int)
  async remapFaculty(
    @Ctx() ctx: Context,
      @Arg("from") from: string,
      @Arg("to") to: string,
  ): Promise<number> {
    if (!from.trim()) {
      throw new Error("Izvorna vrijednost je prazna.");
    }

    if (isFaculty(from)) {
      throw new Error(`'${ from }' je već službeni naziv fakulteta.`);
    }

    if (!isFaculty(to)) {
      throw new Error(`'${ to }' nije na popisu fakulteta.`);
    }

    const { count } = await ctx.prisma.resumeFaculty.updateMany({
      where: {
        name: from,
      },
      data: {
        name: to,
      },
    });

    void EventsService.logEvent("faculty:remap", ctx.user?.id, { from, to, count });

    return count;
  }

  @Authorized(Role.Admin)
  @Mutation(() => Int)
  async clearFaculty(
    @Ctx() ctx: Context,
      @Arg("from") from: string,
  ): Promise<number> {
    if (!from.trim()) {
      throw new Error("Izvorna vrijednost je prazna.");
    }

    if (isFaculty(from)) {
      throw new Error(`'${ from }' je već službeni naziv fakulteta.`);
    }

    const { count } = await ctx.prisma.resumeFaculty.updateMany({
      where: {
        name: from,
      },
      data: {
        name: "",
        module: "",
      },
    });

    void EventsService.logEvent("faculty:clear", ctx.user?.id, { from, count });

    return count;
  }
}

export const transformSelect = transformSelectFor<ResumeFacultyFieldResolver>({});
