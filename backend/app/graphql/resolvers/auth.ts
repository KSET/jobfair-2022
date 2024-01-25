import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Info,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  EventReservationCreateNestedManyWithoutUserInput,
  User,
  UserCreateInput,
} from "@generated/type-graphql";
import {
  omit,
} from "rambdax";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  set,
} from "lodash";
import type {
  Session as ContextSession,
} from "../../types/apollo-context";
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
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  EventsService,
} from "../../services/events-service";
import {
  toSelect,
} from "../helpers/resolver";
import {
  Dict,
  GQLResponse,
} from "../../types/helpers";
import {
  Role,
} from "../../helpers/auth";
import {
  SessionService,
} from "../../services/session-service";
import {
  transformSelect as transformSelectUser,
} from "./user";

@ObjectType()
class AuthResponse extends ValidationResponseFor(User) {
}

@InputType()
export class UserRegisterInput extends UserCreateInput {
  @Field()
    passwordRepeat: string = "";
}

const transformSelect = (select: Dict) => transformSelectUser(select.entity as Dict);

type Assign<T extends Dict, U extends Dict> = Omit<T, keyof U> & U;

type SessionUser = NonNullable<ContextSession["user"]>;
type QSessionUser = Assign<SessionUser, {
  sessionId: string,
}>;

@ObjectType()
class Session implements QSessionUser {
  @Field(() => Int)
  public id: SessionUser["id"] = 0;

  @Field(() => String)
  public sessionId: string = "";

  @Field(() => String)
  public ip: SessionUser["ip"] = "";

  @Field(() => String)
  public loggedInAt: string = "2023-04-18T11:07:06.478Z";

  @Field(() => String)
  public userAgent: SessionUser["userAgent"] = "";
}

@Resolver()
export class AuthResolver {
  @Query((_returns) => [ Session ])
  sessions(
    @Ctx() ctx: Context,
  ): GQLResponse<Session[]> {
    const { user } = ctx;

    if (!user) {
      return Promise.resolve([]);
    }

    return SessionService.listSessions(ctx.prisma, user.id);
  }

  @Authorized(Role.Admin)
  @Query((_returns) => [ Session ])
  sessionsFor(
    @Ctx() ctx: Context,
      @Arg("uid") uid: string,
  ): GQLResponse<Session[]> {
    return ctx.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          uid,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return SessionService.listSessions(prisma, user.id);
    }).catch(() => []);
  }

  @Mutation((_returns) => AuthResponse)
  async login(
    @Ctx() ctx: Context,
      @Info() gqlResolveInfo: GraphQLResolveInfo,
      @Arg("identifier") identifier: string,
      @Arg("password") password: string,
  ): Promise<AuthResponse> {
    const user = await AuthService.authenticateUser(identifier, password);

    if (!user) {
      void EventsService.logEvent("user:login:attempt", null, { identifier });
      return {
        errors: [
          {
            field: "user",
            message: "Invalid username or password",
          },
        ],
      };
    }

    ctx.session.user = {
      id: user.id,
      ip: ctx.req.ip,
      userAgent: ctx.req.headers["user-agent"] ?? "unknown",
      loggedInAt: new Date(),
    };

    const userData = await ctx.prisma.user.findFirst({
      where: {
        id: user.id,
      },
      select: toSelect(gqlResolveInfo, transformSelect),
    }) as unknown as User;

    void EventsService.logEvent("user:login", user.id);

    return {
      entity: userData,
    };
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
      @Info() gqlResolveInfo: GraphQLResolveInfo,
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

    let userSelect = toSelect(gqlResolveInfo, transformSelect);
    userSelect = set(userSelect, "id", true);
    const user = await ctx.prisma.user.create({
      data: {
        ...omit([ "passwordRepeat" ])(data),
        password: await PasswordService.hashPassword(data.password),
      },
      select: userSelect,
    }) as unknown as User;

    // Log the user in
    ctx.session.user = {
      id: user.id!,
      ip: ctx.req.ip,
      userAgent: ctx.req.headers["user-agent"] ?? "unknown",
      loggedInAt: new Date(),
    };

    void EventsService.logEvent("user:register", user.id);

    const sessionSaveError = await new Promise((resolve) => ctx.session.save(resolve));

    if (sessionSaveError) {
      console.error("Session save error", sessionSaveError);
    }

    return {
      entity: user,
    };
  }
}
