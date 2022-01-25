import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
} from "type-graphql";
import {
  Industry,
} from "@generated/type-graphql";
import {
  Context,
} from "../../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../../helpers/auth";
import {
  EventsService,
} from "../../services/events-service";

export {
  FindManyIndustryResolver,
} from "@generated/type-graphql";

@Resolver()
export class IndustryResolver {
  @Mutation(() => Industry, { nullable: true })
  createIndustry(
    @Ctx() ctx: Context,
      @Arg("name") name: string,
  ): Promise<Industry> | null {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    void EventsService.logEvent("industry:create", ctx.user.id, name);

    return ctx.prisma.industry.create({
      data: {
        name,
      },
    });
  }

  @Mutation(() => Industry, { nullable: true })
  renameIndustry(
    @Ctx() ctx: Context,
      @Arg("oldName") oldName: string,
      @Arg("newName") newName: string,
  ): Promise<Industry> | null {
    if (!ctx.user) {
      return null;
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return null;
    }

    void EventsService.logEvent("industry:rename", ctx.user.id, { old: oldName, new: newName });

    return ctx.prisma.industry.update({
      where: {
        name: oldName,
      },
      data: {
        name: newName,
      },
    });
  }
}
