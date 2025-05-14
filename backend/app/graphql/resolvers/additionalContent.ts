import { Arg, Authorized, Ctx, Field, FieldResolver, Info, InputType, Mutation, ObjectType, Resolver, Root } from "type-graphql";
import { PresenterCreateInput } from "./companyPresenter";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { AdditionalContent, ApplicationPresenter, CalendarItem } from "@generated/type-graphql";
import { Dict, GQLField, GQLResponse } from "../../types/helpers";
import { transformSelect as transformSelectPresenter } from "./companyPresenter";
import {transformSelect as transformSelectEvent} from "./calendarItem"
import { GraphQLResolveInfo } from "graphql";
import { Role } from "../../helpers/auth";
import { Context, SessionUser } from "../../types/apollo-context";
import { FileUpload } from "graphql-upload";
import { createPhoto } from "../helpers/photo";
import { ImageBase } from "../../services/image-service";
import { pick } from "rambdax";
import { Prisma } from "@prisma/client";
import { prisma } from "../../providers/prisma";
import { ValidationResponseFor } from "../helpers/validation";

@Resolver(() => AdditionalContent)
export class AdditionalContentFieldResolver {
  @FieldResolver(() => [ ApplicationPresenter ])
  presenters(
    @Root() content: AdditionalContent,
  ): ApplicationPresenter[] {
    return content.presenters || [];
  }

  @FieldResolver(() => CalendarItem, { nullable: true })
  event(
    @Root() content: AdditionalContent,
  ): GQLField<CalendarItem, "nullable"> {
    return content.event;
  }

  @FieldResolver(() => Number)
  async reservation(
    @Root() content: AdditionalContent,
      @Ctx() ctx: Context,
  ): Promise<GQLField<number>> {
    const { user } = ctx;

    if (!user) {
      return 0;
    }

    const reservation = await ctx.prisma.eventReservation.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        eventId_eventType_userId: {
          eventType: "other",
          eventId: content.id!,
          userId: user.id,
        },
      },
    });

    return reservation?.status ?? 0;
  }
}

export const transformSelect = transformSelectFor<AdditionalContentFieldResolver>({
  presenters(select) {
    select.presenters = {
      select: transformSelectPresenter(select.presenters as Record<string, unknown>),
    };

    return select;
  },

  event(select) {
    select.event = {
      select: transformSelectEvent(select.event as Dict),
    };

    return select;
  },
});

@InputType()
class AdditionalContentCreateInputBase {
  @Field()
    titleEn: string = "";

  @Field()
    titleHr: string = "";

  @Field()
    descriptionEn: string = "";

  @Field()
    descriptionHr: string = "";
}


@InputType()
export class AdditionalContentCreateInput extends AdditionalContentCreateInputBase {
  @Field(() => [ PresenterCreateInput ])
    presenters: PresenterCreateInput[] = [];
}

@InputType()
export class AdditionalContentUpdateInput extends AdditionalContentCreateInputBase {
  @Field(() => [ PresenterCreateInput ])
    presenters: PresenterCreateInput[] = [];
  @Field(() => String)
    uid: string = "";
}

type PresenterCreate = NonNullable<NonNullable<NonNullable<NonNullable<Prisma.CompanyApplicationUpdateArgs["data"]["workshop"]>["create"]>["presenters"]>["create"]>;


const createPresenters =
async (
  oldContent: AdditionalContent | null,
  presenters: PresenterCreateInput[],
  eventName: String,
  user: SessionUser,
): Promise<PresenterCreate> => {
  const presentersCreate: PresenterCreate = [];

  for (const presenter of presenters) {
    const i = presenters.indexOf(presenter);
    const presenterCreate: PresenterCreate = {
      ...presenter,
      photo: {
        connect: {
          id: 0,
        },
      },
    };

    const baseId = `${ eventName }.presenter.${ i }`;

    const photoFile = await presenter.photo;
    const oldPhoto =
      (
        oldContent
        && oldContent.presenters
      )
        ? oldContent.presenters[i]?.photo
        : null
    ;

    const [
      err,
      photoId,
    ] = await createPhoto(
      photoFile,
      pick("id", oldPhoto),
      `event/otherContent/${ eventName }/presenters` as ImageBase,
      user
    );

    if (err) {
      throw new PresenterCreateError(
        `${ baseId }.photo`,
        err,
      );
    }

    presenterCreate.photo = {
      connect: {
        id: photoId!,
      },
    };

    presentersCreate.push(presenterCreate);
  }

  return presentersCreate;
};

export class PresenterCreateError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(message);
  }
}


@ObjectType()
class CreateAdditionalContentResponse extends ValidationResponseFor(AdditionalContent) {
}

@Resolver(() => AdditionalContent)
export class AdditionalContentResolver {
  @Authorized(Role.Admin)
  @Mutation(() => CreateAdditionalContentResponse, { nullable: true })
  async createAdditionalContent(
    @Ctx() ctx: Context,
      @Arg("input", () => AdditionalContentCreateInput) input: AdditionalContentCreateInput,
  ): GQLResponse<CreateAdditionalContentResponse, "nullable"> {

    try {
      const presentersCreate: PresenterCreate = await createPresenters(null, input.presenters, input.titleHr, ctx.user!);
      
      return {
        entity: 
          await ctx.prisma.additionalContent.create({
          data: {
            descriptionEn: input.descriptionEn,
            descriptionHr: input.descriptionHr,
            titleEn: input.titleEn,
            titleHr: input.titleHr,
            presenters: {
              create: presentersCreate,
            },
          }
        }) 
      }

    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }
  }

  @Authorized(Role.Admin)
  @Mutation(() => CreateAdditionalContentResponse, { nullable: true })
  async updateAdditionalContent(
    @Ctx() ctx: Context,
      @Arg("input", () => AdditionalContentUpdateInput) input: AdditionalContentUpdateInput,
  ): GQLResponse<CreateAdditionalContentResponse, "nullable"> {

    const oldContent = await prisma.additionalContent.findFirst({
      where: {
        uid: input.uid,
      },
      include: {
        presenters: true,
      }
    });


    try {
      const presentersCreate: PresenterCreate = await createPresenters(oldContent, input.presenters, input.titleHr, ctx.user!);
      
      return {
        entity: 
          await ctx.prisma.additionalContent.update({
          data: {
            descriptionEn: input.descriptionEn,
            descriptionHr: input.descriptionHr,
            titleEn: input.titleEn,
            titleHr: input.titleHr,
            presenters: {
              create: presentersCreate
            },
          },
          where: {
            uid: input.uid
          }
        }) 
      }

    } catch (e) {
      if (e instanceof PresenterCreateError) {
        return {
          errors: [
            {
              field: e.field,
              message: e.message,
            },
          ],
        };
      }

      throw e;
    }
  }

  @Authorized(Role.Admin)
  @Mutation(() => AdditionalContent, { nullable: true })
  deleteAdditionalContent(
    @Ctx() ctx: Context,
      @Arg("uid", () => String) uid: string,
  ): GQLResponse<boolean> { 
    return ctx.prisma.additionalContent.delete({
      where: {
        uid,
      },
    }).then(() => true).catch(() => false);
  }
}