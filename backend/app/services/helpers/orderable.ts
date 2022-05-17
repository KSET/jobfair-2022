import {
  PrismaClient,
} from "@prisma/client";
import type {
  Prisma,
} from "@prisma/client";
import {
  CamelCase,
  ConditionalPick,
} from "type-fest";
import {
  Dict,
} from "../../types/helpers";

type AllModelNames = CamelCase<Prisma.ModelName>;

type PrismaModels = Pick<PrismaClient, AllModelNames>;

type OrderableModels =
  ConditionalPick<PrismaModels,
  {
    updateMany: (args: {
      data: { order: number, },
      where: { order: number, },
    }) => unknown,
  }>
  ;

export type OrderableModelNames = keyof OrderableModels;

export const swap =
  <T extends OrderableModelNames>(
    model: T,
    prisma: PrismaClient,
    {
      a,
      b,
    }: {
      a: number,
      b: number,
    },
    where: Parameters<PrismaModels[T]["updateMany"]>[0]["where"] = {},
  ) => {
    const prismaModel = prisma[model];

    const actions = [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaModel.updateMany({
        data: {
          order: -1,
        },
        where: {
          order: a,
          ...where as Dict,
        },
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaModel.updateMany({
        data: {
          order: a,
        },
        where: {
          order: b,
          ...where as Dict,
        },
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaModel.updateMany({
        data: {
          order: b,
        },
        where: {
          order: -1,
          ...where as Dict,
        },
      }),
    ];

    if ("$transaction" in prisma) {
      return prisma.$transaction(actions);
    } else {
      const h =
        async <T>(actions: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> => {
          const done = [] as Awaited<T>[];
          for (const action of actions) {
            done.push(await action);
          }
          return done;
        }
      ;

      return h<Prisma.BatchPayload>(actions);
    }
  }
;
