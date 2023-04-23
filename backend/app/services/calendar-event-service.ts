import {
  prisma,
} from "../providers/prisma";
import {
  EventType,
} from "../graphql/helpers/event-status";


type PrismaClient = typeof prisma;

export class CalendarEventService {
  public static async getItemIdForEvent(
    prisma: Pick<PrismaClient, "applicationWorkshop" | "applicationTalk" | "companyPanel">,
    type: EventType,
    uid: string,
  ) {
    switch (type) {
      case "workshop": {
        return await prisma.applicationWorkshop.findFirst({
          where: {
            uid,
          },
          select: {
            id: true,
          },
        });
      }
      case "talk": {
        return await prisma.applicationTalk.findFirst({
          where: {
            uid,
          },
          select: {
            id: true,
          },
        });
      }
      case "panel": {
        return await prisma.companyPanel.findFirst({
          where: {
            uid,
          },
          select: {
            id: true,
          },
        });
      }
    }

    return null;
  }
}
