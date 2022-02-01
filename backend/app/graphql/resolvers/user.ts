import {
  User,
  Company,
  FindManyUserArgs,
  Role as QRole,
  UserCreateInput,
} from "@generated/type-graphql";
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
import {
  omit,
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
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  transformSelect as transformSelectCompany,
} from "./company";

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

export const transformSelect = transformSelectFor<UserFieldResolver>({
  roles(select) {
    select.usersRoles = {
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
    select.usersCompanies = {
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
    select.firstName = true;
    select.lastName = true;
    delete select.name;

    return select;
  },
});

@ObjectType()
class UpdateProfileResponse extends ValidationResponseFor(User) {
}

@ObjectType()
class UpdatePasswordResponse extends ValidationResponseFor(User) {
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

    return ctx.prisma.user.findMany({
      ...args,
      select: toSelect(info, transformSelect),
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
