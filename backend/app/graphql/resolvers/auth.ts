import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import {
  User,
  UserCreateInput,
} from "@generated/type-graphql";
import {
  omit,
} from "rambdax";
import {
  Context,
} from "../../types/apollo-context";
import {
  PasswordService,
} from "../../services/password-service";
import {
  AuthService,
} from "../../services/auth-service";
import {
  RegisterValidation,
} from "../../services/validation-service";

@ObjectType({
  simpleResolvers: true,
})
export class FieldError {
  @Field()
    field: string = "";

  @Field()
    message: string = "";
}

@ObjectType({
  simpleResolvers: true,
})
export class AuthResponse {
  @Field(() => [ FieldError ], { nullable: true })
    errors?: FieldError[];

  @Field(() => User, { nullable: true })
    user?: User;
}

@InputType()
export class UserRegisterInput extends UserCreateInput {
  @Field()
    passwordRepeat: string = "";
}

@Resolver()
export class AuthResolver {
  @Mutation((_returns) => AuthResponse)
  async login(
    @Ctx() ctx: Context,
      @Arg("identifier") identifier: string,
      @Arg("password") password: string,
  ): Promise<AuthResponse> {
    const user = await AuthService.authenticateUser(identifier, password);

    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "Invalid username or password",
          },
        ],
      };
    }

    ctx.session.userId = user.id;
    return { user };
  }

  @Mutation((_returns) => Boolean)
  async logout(
  @Ctx() ctx: Context,
  ) {
    try {
      await new Promise((resolve) => ctx.session.destroy(resolve));
    } catch {
      return false;
    }

    return true;
  }

  @Mutation((_returns) => AuthResponse)
  async register(
    @Ctx() ctx: Context,
      @Arg("info") data: UserRegisterInput,
  ): Promise<AuthResponse> {
    data.email = data.email.toLowerCase();
    data.phone = data.phone.replaceAll(" ", "");

    // Validate data
    {
      const { errors } = await RegisterValidation(data);

      if (data.password !== data.passwordRepeat) {
        errors.push({
          field: "passwordRepeat",
          message: "Must be the same as `password`",
        });
      }

      if (errors.length) {
        return {
          errors,
        };
      }
    }

    // Check that the user doesn't already exist
    {
      const exists = await ctx.prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: {
          id: true,
        },
      });

      if (exists) {
        return {
          errors: [
            {
              field: "user",
              message: "Email taken",
            },
          ],
        };
      }
    }

    const user = await ctx.prisma.user.create({
      data: {
        ...omit([ "passwordRepeat" ])(data),
        password: await PasswordService.hashPassword(data.password),
      },
    });

    // Log the user in
    ctx.session.userId = user.id;

    return {
      user,
    };
  }
}
