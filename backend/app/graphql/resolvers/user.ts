import {
  User,
  applyModelsEnhanceMap,
  FindManyUserArgs,
  Role,
} from "@generated/type-graphql";
import {
  transformFields,
} from "@generated/type-graphql/helpers";
import {
  Args,
  Ctx,
  FieldResolver,
  Info,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import graphqlFields from "graphql-fields";
import {
  Context,
} from "../../types/apollo-context";

applyModelsEnhanceMap({
  User: {},
});

const selectTransform: Record<string, (select: Record<string, unknown>) => void> = {
  roles(select) {
    select.usersRoles = {
      include: {
        role: {
          select: select.roles,
        },
      },
    };
  },

  name(select) {
    select.firstName = true;
    select.lastName = true;
  },
};

@Resolver((_of) => User)
export class UserResolver {
  @FieldResolver((_type) => String)
  name(
  @Root() user: User,
  ) {
    return `${ user.firstName } ${ user.lastName }`;
  }

  @FieldResolver((_type) => [ Role ])
  roles(
  @Root() user: User,
  ) {
    return user.usersRoles?.map(({ role }) => role) || [];
  }

  @Query((_type) => [ User ])
  async users(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyUserArgs,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const select = transformFields(graphqlFields(info));

    for (const key of Object.keys(select)) {
      selectTransform[key]?.(select);
      if (key in this) {
        delete select[key];
      }
    }

    return await ctx.prisma.user.findMany({
      ...args,
      select,
    });
  }

  @Query(() => User, { nullable: true })
  profile(@Ctx() ctx: Context) {
    return ctx.user;
  }
}
