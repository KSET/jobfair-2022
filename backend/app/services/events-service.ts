import {
  prisma,
} from "../providers/prisma";

export class EventsService {
  public static async logEvent(name: string, userId?: number, data?: unknown) {
    try {
      return await prisma.eventLog.create({
        data: {
          name,
          user: {
            connect: {
              id: userId,
            },
          },
          data: data !== undefined ? JSON.stringify(data) : data,
        },
      });
    } catch {
      return null;
    }
  }
}
