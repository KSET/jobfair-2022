import {
  EventLog,
} from "@generated/type-graphql";
import {
  prisma,
} from "../providers/prisma";

export class EventsService {
  public static logEvent(name: string, userId?: number | null, payload?: unknown): Promise<EventLog | null> {
    try {
      const data = {
        name,
        data: payload !== undefined ? JSON.stringify(payload) : payload,
      };

      if (userId) {
        (data as Record<string, unknown>).user = {
          connect: {
            id: userId,
          },
        };
      }

      return prisma.eventLog.create({
        data,
      }).then((x) => x);
    } catch {
      return Promise.resolve(null);
    }
  }
}
