import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Info,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  User,
  Season,
  LiveVote,
  LiveVoteComment,
} from "@generated/type-graphql";
import { Dict, GQLField, GQLResponse } from "../../types/helpers";
import { toSelect, transformSelectFor } from "../helpers/resolver";
import { transformSelect as transformSelectUser } from "./user";
import { transformSelect as transformSelectSeason } from "./season";
import { Context } from "../../types/apollo-context";
import { GraphQLResolveInfo } from "graphql";
import { Role, hasAtLeastRole } from "../../helpers/auth";

@Resolver((_of) => LiveVote)
export class LiveVoteFieldResolver {
  @FieldResolver((_type) => User)
  forUser(@Root() root: LiveVote): GQLField<User> {
    return root.forUser!;
  }

  @FieldResolver((_type) => Season)
  forSeason(@Root() root: LiveVote): GQLField<Season> {
    return root.forSeason!;
  }
}

@Resolver((_of) => LiveVoteComment)
export class LiveVoteCommentFieldResolver {
  @FieldResolver((_type) => User)
  forUser(@Root() root: LiveVoteComment): GQLField<User> {
    return root.forUser!;
  }

  @FieldResolver((_type) => Season)
  forSeason(@Root() root: LiveVoteComment): GQLField<Season> {
    return root.forSeason!;
  }
}

export const transformSelect = transformSelectFor<LiveVoteFieldResolver>({
  forUser(select) {
    select.forUser = {
      select: transformSelectUser(select.forUser as Dict),
    };
    return select;
  },

  forSeason(select) {
    select.forSeason = {
      select: transformSelectSeason(select.forSeason as Dict),
    };
    return select;
  },
});

@ObjectType()
export class LiveVoteResult {
  @Field(() => String, { nullable: false })
  option: string = "";

  @Field(() => Int, { nullable: false })
  voteCount: number = 0;
}

@Resolver(() => LiveVote)
export class LiveVoteResolver {
  @Query(() => [LiveVote])
  async liveVotes(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
  ): GQLResponse<LiveVote[]> {
    if (!ctx.user) {
      return [];
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return ctx.prisma.liveVote.findMany({
      where: {
        forSeason: {
          uid: seasonUid,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Query(() => [LiveVoteResult])
  async liveVoteResults(
    @Ctx() ctx: Context,
    @Arg("seasonUid", () => String) seasonUid: string,
  ): GQLResponse<LiveVoteResult[]> {
    const res = await ctx.prisma.liveVote.groupBy({
      by: ["option"],
      _count: {
        _all: true,
      },
      where: {
        forSeason: {
          uid: seasonUid,
        },
      },
    });

    return res.map((x) => ({
      option: x.option,
      voteCount: x._count._all,
    })).sort((lt, gt) => lt.option.localeCompare(gt.option));
  }

  @Query(() => LiveVote, { nullable: true })
  async myLiveVote(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
  ): GQLResponse<LiveVote, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    return ctx.prisma.liveVote.findFirst({
      where: {
        forSeason: {
          uid: seasonUid,
        },
        forUserId: ctx.user.id,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Mutation(() => LiveVote, { nullable: true })
  async createLiveVote(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
    @Arg("vote", () => String) vote: string,
  ): GQLResponse<LiveVote, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const season = await ctx.prisma.season.findFirst({
      where: {
        uid: seasonUid,
      },
      select: {
        id: true,
      },
    });

    if (!season) {
      return null;
    }

    return ctx.prisma.liveVote
      .upsert({
        where: {
          forSeasonId_forUserId: {
            forUserId: ctx.user.id,
            forSeasonId: season.id,
          },
        },
        create: {
          forSeasonId: season.id,
          forUserId: ctx.user.id,
          option: vote,
        },
        update: {
          option: vote,
        },
        select: toSelect(gqlInfo, transformSelect),
      })
      .catch((e) => {
        console.error(e);
        return null;
      });
  }
}

@Resolver(() => LiveVoteComment)
export class LiveVoteCommentResolver {
  @Query(() => [LiveVoteComment])
  async liveVoteComments(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
  ): GQLResponse<LiveVoteComment[]> {
    if (!ctx.user) {
      return [];
    }

    if (!hasAtLeastRole(Role.Admin, ctx.user)) {
      return [];
    }

    return ctx.prisma.liveVoteComment.findMany({
      where: {
        forSeason: {
          uid: seasonUid,
        },
      },
      orderBy: {
        id: "desc",
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Query(() => [LiveVoteComment])
  async myLiveVoteComments(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
  ): GQLResponse<LiveVoteComment[]> {
    if (!ctx.user) {
      return [];
    }

    return ctx.prisma.liveVoteComment.findMany({
      where: {
        forSeason: {
          uid: seasonUid,
        },
        forUserId: ctx.user.id,
      },
      orderBy: {
        id: "desc",
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Mutation(() => LiveVoteComment, { nullable: true })
  async createLiveVoteComment(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("seasonUid", () => String) seasonUid: string,
    @Arg("comment", () => String) comment: string,
  ): GQLResponse<LiveVoteComment, "nullable"> {
    if (!ctx.user) {
      return null;
    }

    const season = await ctx.prisma.season.findFirst({
      where: {
        uid: seasonUid,
      },
      select: {
        id: true,
      },
    });

    if (!season) {
      return null;
    }

    comment = comment.trim().slice(0, 400);

    if (!comment) {
      return null;
    }

    return ctx.prisma.liveVoteComment.create({
      data: {
        comment,
        forUserId: ctx.user.id,
        forSeasonId: season.id,
      },
      select: toSelect(gqlInfo, transformSelect),
    });
  }

  @Mutation(() => Boolean)
  async deleteLiveVoteComment(
    @Ctx() ctx: Context,
    @Info() gqlInfo: GraphQLResolveInfo,
    @Arg("commentId", () => Int) commentId: number,
  ): GQLResponse<boolean> {
    if (!ctx.user) {
      return false;
    }

    const isAdmin = hasAtLeastRole(Role.Admin, ctx.user);

    return ctx.prisma.liveVoteComment
      .delete({
        where: {
          id: commentId,
          forUserId: isAdmin ? undefined : ctx.user.id,
        },
      })
      .then(() => true)
      .catch(() => false);
  }
}
