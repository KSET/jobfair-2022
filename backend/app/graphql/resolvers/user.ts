import {
  User,
  Company,
  applyModelsEnhanceMap,
  FindManyUserArgs,
  Role as QRole,
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
  keys,
  omit,
  reduce,
} from "rambdax";
import {
  Context,
} from "../../types/apollo-context";
import {
  PasswordUpdateValidation,
  ProfileValidation,
} from "../../services/validation-service";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  PasswordService,
} from "../../services/password-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  transformSelect as transformSelectCompany,
} from "./company";

applyModelsEnhanceMap({
  User: {},
});

const selectTransform: Record<string, <T extends Record<string, unknown>>(select: T) => T> = {
  roles(select) {
    (select as Record<string, unknown>).usersRoles = {
      include: {
        role: {
          select: select.roles,
        },
      },
    };
    delete select.roles;

    return select;
  },

  companies(select) {
    (select as Record<string, unknown>).usersCompanies = {
      include: {
        company: {
          select: transformSelectCompany(select.companies as Record<string, unknown>),
        },
      },
    };
    delete select.companies;

    return select;
  },

  name(select) {
    (select as Record<string, unknown>).firstName = true;
    (select as Record<string, unknown>).lastName = true;
    delete select.name;

    return select;
  },
};

export const transformSelect = <T extends Record<string, unknown>>(select: T): T => reduce(
  (acc, key) =>
    selectTransform[key as string]?.(acc) ?? acc
  ,
  select,
  keys(select),
);

@ObjectType()
class UpdateProfileResponse extends ValidationResponseFor(User) {
}

@ObjectType()
class UpdatePasswordResponse extends ValidationResponseFor(User) {
}

@Resolver((_of) => User)
export class UserFieldResolver {
  @FieldResolver((_type) => String)
  name(
  @Root() user: User,
  ) {
    return `${ user.firstName } ${ user.lastName }`;
  }

  @FieldResolver((_type) => [ QRole ])
  roles(
  @Root() user: User,
  ) {
    return user.usersRoles?.map(({ role }) => role) || [];
  }

  @FieldResolver((_type) => [ Company ])
  companies(
    @Root() user: User,
  ): Company[] {
    return user.usersCompanies?.map(({ company }) => company!) || [];
  }
}

@Resolver((_of) => User)
export class UserInfoResolver {
  @Query((_type) => [ User ])
  users(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Args() args: FindManyUserArgs,
  ) {
    if (!ctx.user) {
      return [];
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const select = transformSelect(transformFields(graphqlFields(info)));

    return ctx.prisma.user.findMany({
      ...args,
      select,
    });
  }
}

@Resolver((_of) => User)
export class UserProfileResolver {
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

    await ctx.prisma.user.update({
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

    void EventsService.logEvent("profile:update", ctx.user.id);

    return {
      entity: ctx.user,
    };
  }

  @Mutation(() => UpdatePasswordResponse, { nullable: true })
  async updatePassword(
    @Ctx() ctx: Context,
      @Arg("currentPassword") currentPassword: string,
      @Arg("newPassword") newPassword: string,
      @Arg("newPasswordRepeat") newPasswordRepeat: string,
  ): Promise<UpdatePasswordResponse> {
    if (!ctx.user) {
      return {
        errors: [
          {
            field: "password",
            message: "Not logged in",
          },
        ],
      };
    }

    // Validate old password
    {
      const valid = await PasswordService.comparePasswords(currentPassword, ctx.user.password);

      if (!valid) {
        return {
          errors: [
            {
              field: "currentPassword",
              message: "Wrong password",
            },
          ],
        };
      }
    }

    // Validate data
    {
      const { errors } = await PasswordUpdateValidation({
        newPassword,
        newPasswordRepeat,
      });

      if (errors.length) {
        return {
          errors,
        };
      }
    }

    await ctx.prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        password: await PasswordService.hashPassword(newPassword),
      },
    });

    void EventsService.logEvent("profile:password:update", ctx.user.id);

    return {
      entity: ctx.user,
    };
  }
}
