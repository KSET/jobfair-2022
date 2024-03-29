import {
  User,
  Resume,
  Company,
  FindManyUserArgs,
  Role as QRole,
  UserCreateInput,
  EventLog,
} from "@generated/type-graphql";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
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
  Prisma,
} from "@prisma/client";
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
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  transformSelect as transformSelectCompanies,
} from "./company";
import {
  transformSelect as transformSelectRoles,
} from "./role";
import {
  transformSelect as transformSelectResume,
} from "./resume";
import {
  transformSelect as transformSelectEventLog,
} from "./eventLog";

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
    return user.roles;
  }

  @FieldResolver((_type) => [ Company ])
  companies(
  @Root() user: User,
  ) {
    return user.companies;
  }

  @FieldResolver((_type) => Resume, { nullable: true })
  resume(
    @Root() user: User,
  ): GQLField<Resume, "nullable"> {
    return user.resume;
  }

  @FieldResolver((_type) => [ EventLog ])
  eventLog(
    @Root() user: User,
      @Ctx() ctx: Context,
  ): GQLField<EventLog[]> {
    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return user.events ?? [];
  }
}

export const transformSelect = transformSelectFor<UserFieldResolver>({
  roles(select) {
    select.roles = {
      select: transformSelectRoles(select.roles as Record<string, unknown>),
    };

    return select;
  },

  companies(select) {
    select.companies = {
      select: transformSelectCompanies(select.companies as Record<string, unknown>),
    };

    return select;
  },

  name(select) {
    select.firstName = true;
    select.lastName = true;
    delete select.name;

    return select;
  },

  resume(select) {
    select.resume = {
      select: transformSelectResume(select.resume as Dict),
    };
    return select;
  },

  eventLog(select) {
    select.events = {
      select: transformSelectEventLog(select.eventLog as Dict),
    };
    delete select.eventLog;

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
      cursor: undefined,
      select: toSelect(info, transformSelect),
    });
  }

  @Query((_type) => User, { nullable: true })
  user(
  @Ctx() ctx: Context,
    @Info() info: GraphQLResolveInfo,
    @Arg("uid") uid: string,
  ) {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    return ctx.prisma.user.findUnique({
      where: {
        uid,
      },
      select: toSelect(info, transformSelect),
    }) as Promise<User | null>;
  }

  @Mutation((_type) => Boolean)
  async updateScannerStatusFor(
  @Ctx() ctx: Context,
    @Arg("uid") uid: string,
    @Arg("isScanner") isScanner: boolean,
  ) {
    if (!ctx.user) {
      return false;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return false;
    }

    const roles = await ctx.prisma.$transaction(async (prisma) => {
      const userData = await prisma.user.findUnique({
        where: {
          uid,
        },
        select: {
          id: true,
        },
      });

      if (!userData) {
        throw new Error("User not found");
      }

      const updateRolesInput = (
        isScanner
          ? {
            connect: {
              name: Role.Scanner,
            },
          }
          : {
            disconnect: {
              name: Role.Scanner,
            },
          }
      ) satisfies Prisma.RoleUpdateManyWithoutUsersNestedInput;

      return prisma.user.update({
        where: {
          id: userData.id,
        },
        data: {
          roles: updateRolesInput,
        },
        select: {
          roles: true,
        },
      }).then((x) => x.roles);
    }).catch(() => null);

    return roles?.some((x) => x.name === String(Role.Scanner)) ?? false;
  }
}

@Resolver((_of) => User)
export class UserProfileResolver {
  @Authorized()
  @Query(() => User, { nullable: true })
  profile(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
  ): GQLResponse<User, "nullable"> {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.user!.id,
      },
      select: toSelect(info, transformSelect),
    });
  }

  @Mutation(() => UpdateProfileResponse, { nullable: true })
  async updateProfile(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
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

    // Check email
    {
      const otherEmailUser = await ctx.prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          uid: true,
        },
      });

      if (otherEmailUser && ctx.user.uid !== otherEmailUser.uid) {
        return {
          errors: [
            {
              field: "email",
              message: "Email already exists",
            },
          ],
        };
      }
    }

    const entity = await ctx.prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        ...omit([
          "password",
          "passwordRepeat",
          "reservations",
        ], data),
      },
      select: transformSelect(toSelect(info, (x) => x).entity as Record<string, unknown> || { uid: true }),
    }) as unknown as User;

    void EventsService.logEvent("profile:update", ctx.user.id);

    return {
      entity,
    };
  }

  @Mutation(() => UpdatePasswordResponse, { nullable: true })
  async updatePassword(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
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

    const entity = await ctx.prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        password: await PasswordService.hashPassword(newPassword),
      },
      select: transformSelect(toSelect(info, (x) => x).entity as Record<string, unknown> || { uid: true }),
    }) as unknown as User;

    void EventsService.logEvent("profile:password:update", ctx.user.id);

    return {
      entity,
    };
  }
}

@InputType()
class UserUpdateInput extends UserCreateInput {
  @Field(() => [ String ])
    roles: string[] = [];
}

@Resolver((_of) => User)
export class UserEditResolver {
  @Mutation(() => UpdateProfileResponse, { nullable: true })
  async updateUser(
    @Ctx() ctx: Context,
      @Info() info: GraphQLResolveInfo,
      @Arg("uid") uid: string,
      @Arg("info") data: UserUpdateInput,
  ): Promise<UpdateProfileResponse | null> {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
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

    // Check email
    {
      const otherEmailUser = await ctx.prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          uid: true,
        },
      });

      if (otherEmailUser && uid !== otherEmailUser.uid) {
        return {
          errors: [
            {
              field: "email",
              message: "Email already exists",
            },
          ],
        };
      }
    }

    const oldUser = await ctx.prisma.user.findUnique({
      where: {
        uid,
      },
      select: {
        password: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!oldUser) {
      return {
        errors: [
          {
            field: "entity",
            message: "User does not exist",
          },
        ],
      };
    }

    if (data.password) {
      data.password = await PasswordService.hashPassword(data.password);
    } else {
      data.password = oldUser.password;
    }

    const entity = await ctx.prisma.user.update({
      where: {
        uid,
      },
      data: {
        ...omit([
          "passwordRepeat",
          "roles",
        ])(data),
        roles: {
          disconnect: oldUser.roles,
          connect: data.roles.map((name) => ({ name })),
        },
      },
      select: transformSelect(toSelect(info, (x) => x).entity as Record<string, unknown> || { uid: true }),
    }) as unknown as User;

    void EventsService.logEvent("user:update", ctx.user.id, { uid });

    return {
      entity,
    };
  }
}
