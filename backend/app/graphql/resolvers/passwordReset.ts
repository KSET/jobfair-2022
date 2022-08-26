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
  PasswordReset,
} from "@generated/type-graphql";
import {
  transformSelectFor,
} from "../helpers/resolver";
import {
  GQLResponse,
} from "../../types/helpers";
import {
  Context,
} from "../../types/apollo-context";
import {
  ValidationResponseFor,
} from "../helpers/validation";
import {
  EmailService,
} from "../../services/email-service";
import {
  TranslationService,
} from "../../services/translation-service";
import {
  EventsService,
} from "../../services/events-service";
import {
  PasswordUpdateValidation,
} from "../../services/validation-service";
import {
  PasswordService,
} from "../../services/password-service";

@Resolver(() => PasswordReset)
export class PasswordResetFieldResolver {
}

export const transformSelect = transformSelectFor<PasswordResetFieldResolver>({});


@InputType()
class PasswordResetUseInput {
  @Field()
    token: string = "";

  @Field()
    newPassword: string = "";

  @Field()
    newPasswordRepeat: string = "";
}


@ObjectType()
class PasswordResetUseResponse extends ValidationResponseFor(Boolean) {
}

class PasswordResetUseError extends Error {
  constructor(public data: PasswordResetUseResponse) {
    super("Something went wrong");
  }
}

@Resolver((_of) => PasswordReset)
export class PasswordResetMutationResolver {
  @Mutation(() => String)
  async requestPasswordReset(
    @Ctx() ctx: Context,
      @Arg("identifier") identifier: string,
  ): GQLResponse<string> {
    const {
      user,
      reset,
    } = await ctx.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: identifier,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          language: true,
        },
      });

      if (!user) {
        return {
          user,
          reset: null,
        };
      }

      const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);

      const oldReset = await prisma.passwordReset.findFirst({
        where: {
          userId: user.id,
          usedAt: null,
          createdAt: {
            gt: tenMinutesAgo,
          },
        },
      });

      if (oldReset) {
        return {
          user,
          reset: null,
        };
      }

      const reset = await prisma.passwordReset.create({
        data: {
          forUser: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return {
        user,
        reset,
      };
    });

    await EventsService.logEvent(
      "passwordReset:request",
      user?.id,
      {
        email: identifier,
        resetId: reset?.id,
        ip: ctx.req.ip,
      },
    );

    if (!user || !reset) {
      return "ok";
    }

    const $t = await TranslationService.getTranslationFor(
      [
        "email.passwordReset.subject",
        "email.passwordReset.body",
        "email.passwordReset.linkText",
      ],
      user.language.replace("-", "_"),
    );

    await EmailService.sendMail(
      {
        name: `${ user.firstName } ${ user.lastName }`,
        address: user.email,
      },
      $t["email.passwordReset.subject"],
      {
        name: "emailForgotPassword",
        parameters: {
          content:
            $t["email.passwordReset.body"]
              .replace(/\$\{\s*name\s*}/gi, `${ user.firstName } ${ user.lastName }`)
              .trim()
              .split("\n"),
          token: reset.uid,
          resetPasswordLinkText: $t["email.passwordReset.linkText"],
        },
      },
    );

    return "ok";
  }

  @Mutation(() => Boolean)
  async checkPasswordReset(
    @Ctx() ctx: Context,
      @Arg("token") token: string,
  ): GQLResponse<boolean> {
    const reset = await ctx.prisma.passwordReset.findFirst({
      where: {
        uid: token,
        usedAt: null,
      },
      select: {
        id: true,
      },
    });

    return Boolean(reset?.id);
  }

  @Mutation(() => PasswordResetUseResponse)
  async usePasswordReset(
    @Ctx() ctx: Context,
      @Arg("info") info: PasswordResetUseInput,
  ): GQLResponse<PasswordResetUseResponse> {
    const {
      token,
      ...passInfo
    } = info;

    {
      const { errors } = await PasswordUpdateValidation(passInfo);

      if (passInfo.newPassword !== passInfo.newPasswordRepeat) {
        errors.push({
          field: "newPasswordRepeat",
          message: "Must be the same as `password`",
        });
      }

      if (errors.length) {
        return {
          errors,
        };
      }
    }

    return ctx.prisma.$transaction(async (prisma) => {
      const reset = await prisma.passwordReset.findFirst({
        where: {
          uid: token,
          usedAt: null,
        },
      });

      if (!reset) {
        throw new PasswordResetUseError({
          errors: [
            {
              field: "user",
              message: "forgot-password.token-invalid",
            },
          ],
        });
      }

      const user = await prisma.user.update({
        where: {
          id: reset.userId,
        },
        data: {
          password: await PasswordService.hashPassword(passInfo.newPassword),
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        throw new PasswordResetUseError({
          errors: [
            {
              field: "user",
              message: "Something went wrong. Please try again.",
            },
          ],
        });
      }

      const usedReset = await prisma.passwordReset.update({
        where: {
          id: reset.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (!usedReset) {
        throw new PasswordResetUseError({
          errors: [
            {
              field: "user",
              message: "Something went wrong. Please try again.",
            },
          ],
        });
      }

      await EventsService.logEvent(
        "passwordReset:use",
        reset.userId,
        {
          resetId: reset?.id,
          ip: ctx.req.ip,
        },
      );

      return {
        entity: true,
      };
    }).catch(async (err: PasswordResetUseError) => {
      await EventsService.logEvent(
        "passwordReset:attempt",
        null,
        {
          resetToken: token,
          ip: ctx.req.ip,
        },
      );

      return err?.data || { entity: false };
    });
  }
}
