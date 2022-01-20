import {
  User,
  applyModelsEnhanceMap,
  FindManyUserArgs,
  Role,
  UserCreateInput,
} from "@generated/type-graphql";
import {
  transformFields,
} from "@generated/type-graphql/helpers";
import {
  Arg,
  Args,
  Ctx,
  FieldResolver,
  Info,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import graphqlFields from "graphql-fields";
import {
  omit,
} from "rambdax";
import {
  Context,
} from "../../types/apollo-context";
import {
  ProfileValidation,
} from "../../services/validation-service";
import {
  ValidationResponseFor,
} from "../helpers/validation";

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

@ObjectType()
class UpdateProfileResponse extends ValidationResponseFor(User) {
}

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

  @Mutation(() => UpdateProfileResponse, { nullable: true })
  async updateProfile(
    @Ctx() ctx: Context,
      @Arg("info") data: UserCreateInput,
  ): Promise<UpdateProfileResponse> {
    if (!ctx.user) {
      return {
        errors: [
          {
            field: "auth",
            message: "Not logged in",
          },
        ],
      };
    }

    // Validate data
    {
      const { errors } = await ProfileValidation(data);

      if (errors.length) {
        return {
          errors,
        };
      }
    }

    const user = await ctx.prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        ...omit([
          "password",
          "passwordRepeat",
        ])(data),
      },
    });

    return {
      entity: user,
    };
  }
}
