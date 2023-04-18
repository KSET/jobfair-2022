import {
  User,
  type Session,
} from "@prisma/client";
import SuperJSON from "superjson";
import {
  Session as ContextSession,
} from "../types/apollo-context";
import {
  prisma,
} from "../providers/prisma";

type SessionUser = NonNullable<ContextSession["user"]>;
type PrismaClient = typeof prisma;

export class SessionService {
  static async listSessions(prisma: Pick<PrismaClient, "$queryRaw">, userId: User["id"]) {
    const rawSessions: Pick<Session, "id" | "data">[] = await prisma.$queryRaw`select id, data from "Session" where cast(data as json)->'json'->'user'->>'id' = ${ String(userId) };`;

    return (
      rawSessions
        .map(
          (x) => {
            const { user } = SuperJSON.parse<{ user: SessionUser, }>(x.data);

            return {
              ...user,
              sessionId: x.id,
              loggedInAt: new Date(user.loggedInAt).toISOString(),
            };
          },
        )
    );
  }
}
