import {
  ApplicationTalkCategory,
  FindManyApplicationTalkCategoryArgs,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
  Ctx,
  Info,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkCategoryFieldResolver {
}

export const transformSelect = transformSelectFor<CompanyApplicationTalkCategoryFieldResolver>({});

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkFindResolver {
  @Query(() => [ ApplicationTalkCategory ])
  talkCategories(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyApplicationTalkCategoryArgs,
  ) {
    return ctx.prisma.applicationTalkCategory.findMany({
      ...args,
      select: toSelect(info, transformSelect),
    });
  }
}

@Resolver(() => ApplicationTalkCategory)
export class CompanyApplicationTalkAdminResolver {
  @Mutation(() => ApplicationTalkCategory, { nullable: true })
  createTalkCategory(
  @Ctx() ctx: Context,
    @Arg("name") name: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    void EventsService.logEvent("talk-category:create", ctx.user.id, name);

    return ctx.prisma.applicationTalkCategory.create({
      data: {
        name,
      },
    });
  }

  @Mutation(() => ApplicationTalkCategory, { nullable: true })
  renameTalkCategory(
  @Ctx() ctx: Context,
    @Arg("oldName") oldName: string,
    @Arg("newName") newName: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    void EventsService.logEvent("talk-category:rename", ctx.user.id, { old: oldName, new: newName });

    return ctx.prisma.applicationTalkCategory.update({
      where: {
        name: oldName,
      },
      data: {
        name: newName,
      },
    });
  }
}
