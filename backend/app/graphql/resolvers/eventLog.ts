import {
  EventLog,
  User,
  EventLogOrderByWithRelationAndSearchRelevanceInput as EventLogOrderByWithRelationAndSearchRelevanceInput_,
} from "@generated/type-graphql";
import {
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Info,
  InputType,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import {
  GraphQLResolveInfo,
} from "graphql";
import {
  clamp,
} from "rambdax";
import {
  toInteger,
} from "lodash";
import type {
  Prisma,
} from "@prisma/client";
import {
  toSelect,
  transformSelectFor,
} from "../helpers/resolver";
import {
  Context,
} from "../../types/apollo-context";
import {
  Dict,
  GQLField,
  GQLResponse,
} from "../../types/helpers";
import {
  Role,
} from "../../helpers/auth";
import {
  PaginationArgs,
  PaginationResultFor,
} from "../helpers/pagination";
import {
  transformSelect as transformSelectUser,
} from "./user";

@Resolver(() => EventLog)
export class EventLogFieldResolver {
  @FieldResolver((_type) => User, { nullable: true })
  user(
    @Root() eventLog: EventLog,
  ): GQLField<User, "nullable"> {
    return eventLog.user;
  }
}

export const transformSelect = transformSelectFor<EventLogFieldResolver>({
  user(select) {
    select.user = {
      select: transformSelectUser(select.user as Dict),
    };

    return select;
  },
});


@ObjectType()
class EventLogPaginationResult extends PaginationResultFor(EventLog) {
}

@InputType()
class EventLogOrderByWithRelationAndSearchRelevanceInput extends EventLogOrderByWithRelationAndSearchRelevanceInput_ {
  @Field({ nullable: true })
    id?: "asc" | "desc";

  @Field({ nullable: true })
    date?: "asc" | "desc";
}

@ArgsType()
class EventLogPaginationArgs extends PaginationArgs {
  @Field({ nullable: true })
    where?: string;

  @Field(() => [ EventLogOrderByWithRelationAndSearchRelevanceInput ], { nullable: true })
    orderBy?: EventLogOrderByWithRelationAndSearchRelevanceInput[];
}

@Resolver(() => EventLog)
export class EventLogInfoResolver {
  @Authorized(Role.Admin)
  @Query(() => EventLogPaginationResult)
  async eventLog(
    @Ctx() ctx: Context,
      @Info() gqlInfo: GraphQLResolveInfo,
      @Args() paginationArgs: EventLogPaginationArgs,
  ): GQLResponse<EventLogPaginationResult> {
    const page = toInteger(Math.max(1, paginationArgs.page));
    const perPage = toInteger(clamp(1, 200, paginationArgs.perPage));

    const where: Prisma.EventLogFindManyArgs["where"] = {
      OR: [
        {
          name: {
            contains: paginationArgs.where,
            mode: "insensitive",
          },
        },
        {
          user: {
            OR: [
              {
                email: {
                  contains: paginationArgs.where,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: paginationArgs.where,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: paginationArgs.where,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
        {
          data: {
            contains: paginationArgs.where,
            mode: "insensitive",
          },
        },
      ],
    };
    const skip = (page - 1) * perPage;

    const orderBy: EventLogOrderByWithRelationAndSearchRelevanceInput[] | undefined =
      0 < (paginationArgs.orderBy?.length ?? 0)
        ? paginationArgs.orderBy
        : [
          {
            id: "desc",
          },
        ]
    ;

    const [ count, resp ] = await Promise.all([
      ctx.prisma.eventLog.count({ where }),
      ctx.prisma.eventLog.findMany({
        orderBy,
        skip,
        take: perPage,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        select: transformSelect(toSelect(gqlInfo, (x) => x).records as Dict || { id: true }) as any,
        where,
      }) as unknown as Promise<EventLog[]>,
    ]);

    return {
      page,
      perPage,
      records: resp,
      totalRecords: count,
    };
  }
}
