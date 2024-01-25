import {
  Args,
  Ctx,
  Info,
  Query,
} from "type-graphql";
import {
  FindManyRoleArgs,
  Role as QRole,
} from "@generated/type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";

export const transformSelect = transformSelectFor({});

export class RoleResolver {
  @Query(() => [ QRole ])
  roles(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyRoleArgs,
  ) {
    if (!ctx.user) {
      return [];
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return ctx.prisma.role.findMany({
      ...args,
      cursor: undefined,
      select: toSelect(info, transformSelect),
    });
  }
}
