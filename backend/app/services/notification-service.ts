import {
  type ApplicationWorkshop,
  type ApplicationPresenter,
  type ApplicationTalk,
  type ApplicationTalkCategory,
  type Company,
  type Industry,
  type User,
  type Season,
  type CompanyApplicationContactPerson,
} from "@prisma/client";
import {
  type Simplify,
} from "type-fest";
import SlackNotificationService from "./slack-notification-service";
import MattermostNotificationService from "./mattermost-notification-service";

export type NotificationEvent =
  | {
    event: "new company",
    data: {
      company: Company & { industry: Industry, },
      creator: User,
    },
  }
  | {
    event: "new application",
    data: {
      company: Company,
      season: Pick<Season, "uid">,
      creator: User,
      contactPerson: Pick<CompanyApplicationContactPerson, "name" | "email" | "phone">,
      chosen: {
        booth?: string | null,
        talk:
        | boolean
        | null
        | (Pick<
        ApplicationTalk,
        | "titleHr"
        | "titleEn"
        | "descriptionHr"
        | "descriptionEn"
        | "language"
        > & {
          category: Pick<ApplicationTalkCategory, "name">,
          presenters: Pick<
          ApplicationPresenter,
          "firstName" | "lastName"
          >[],
        }),
        workshop:
        | boolean
        | null
        | (Pick<
        ApplicationWorkshop,
        | "titleHr"
        | "titleEn"
        | "descriptionHr"
        | "descriptionEn"
        | "language"
        | "notesHr"
        | "notesEn"
        | "goal"
        > & {
          presenters: Pick<
          ApplicationPresenter,
          "firstName" | "lastName"
          >[],
        }),
        panel: boolean,
        cocktail: boolean,
      },
    },
  }
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | never;

export type NotificationEventData<T extends NotificationEvent["event"]> =
  Simplify<Extract<NotificationEvent, { event: T, }>["data"]>;

type NotificationEventHandler<T extends NotificationEvent["event"]> = (
  data: NotificationEventData<T>,
) => Promise<unknown>;

type ObjectFromEntrySet<
  E extends { event: NotificationEvent["event"], data: unknown, },
> = Simplify<{
  [K in E["event"]]: NotificationEventHandler<K>[];
}>;

type NotificationEventObject = ObjectFromEntrySet<NotificationEvent>;

const EVENT_HANDLERS = {
  "new company": [],
  "new application": [],
} satisfies NotificationEventObject as NotificationEventObject;

export class NotificationService {
  static async notify<T extends NotificationEvent["event"]>(event: T, data: NotificationEventData<T>) {
    const handlers = EVENT_HANDLERS[event];

    if (handlers) {
      await Promise.all(handlers.map((handler) => handler(data)));
    }
  }
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || null;
if (SLACK_WEBHOOK_URL) {
  EVENT_HANDLERS["new company"].push((data) =>
    SlackNotificationService.notifyOfNewCompany(data.company, data.creator),
  );

  EVENT_HANDLERS["new application"].push((data) =>
    SlackNotificationService.notifyOfNewApplication(
      data.company,
      data.season,
      data.creator,
      {
        ...data.chosen,
        talk: Boolean(data.chosen.talk),
        workshop: Boolean(data.chosen.workshop),
      },
    ),
  );
}

const MATTERMOST_WEBHOOK_URL = process.env.MATTERMOST_WEBHOOK_URL || null;
if (MATTERMOST_WEBHOOK_URL) {
  EVENT_HANDLERS["new company"].push((data) =>
    MattermostNotificationService.notifyOfNewCompany(
      data.company,
      data.creator,
    ),
  );

  EVENT_HANDLERS["new application"].push((data) =>
    MattermostNotificationService.notifyOfNewApplication(
      data.company,
      data.season,
      data.creator,
      data.contactPerson,
      data.chosen,
    ),
  );
}
