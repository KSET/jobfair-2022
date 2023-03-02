import {
  prisma,
} from "../providers/prisma";

export class EventsService {
  public static logEvent(name: string, userId?: number | null, payload?: unknown): Promise<boolean> {
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

    return (
      prisma
        .eventLog
        .create({
          data,
          select: {
            id: true,
          },
        })
        .then(() => true)
        .catch(() => false)
    );
  }
}
