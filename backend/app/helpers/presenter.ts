import {
  type Prisma,
} from "@prisma/client";

export const presenterOrderBy: Prisma.ApplicationPresenterOrderByWithRelationInput[] = [
  { order: "asc" },
  { id: "asc" },
];

export const oldPresentersSelect = {
  orderBy: presenterOrderBy,
  select: {
    id: true,
    photo: {
      select: {
        id: true,
        uid: true,
      },
    },
  },
} as const;

export const oldEventPresentersSelect = {
  select: {
    id: true,
    presenters: oldPresentersSelect,
  },
} as const;
