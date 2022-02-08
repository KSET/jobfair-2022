import {
  Company,
  Industry,
  User,
} from "@prisma/client";
import {
  filter,
  piped,
} from "rambdax";
import {
  isString,
  snakeCase,
} from "lodash/fp";
import {
  deepMap,
} from "../helpers/object";
import {
  post,
} from "../helpers/axios";

export default class SlackNotificationService {
  static notifyOfNewCompany(
    company: Company & { industry: Industry, },
    creator: User,
  ) {
    const text = `
*NOVO PODUZEĆE*
-------------------------
*Poduzeće*
  - Ime: ${ company.brandName }
  - Pravno ime: ${ company.legalName }
  - Stranica: ${ company.website }
  - Industrija: ${ company.industry.name }

*Kontakt*
  - Ime: ${ creator.firstName } ${ creator.lastName }
  - Email: ${ creator.email }
  - Broj: ${ creator.phone }
-------------------------
`;

    const channel =
      ("production" === process.env.NODE_ENV)
        ? "#prijave"
        : "#prijave-test"
    ;

    return this.sendPayload({
      username: "Job Fair Firmatizator",
      channel,
      text,
    });
  }

  static notifyOfNewApplication(
    company: Company,
    creator: User,
    chosen: {
      booth: string | null,
      talk: boolean,
      workshop: boolean,
      panel: boolean,
      cocktail: boolean,
    },
  ) {
    const has = (bool: boolean) => bool ? ":white_check_mark:" : ":x:";

    const text = `
*NOVA PRIJAVA*
-------------------------
*Poduzeće*
  - Ime: ${ company.brandName }

*Odabrano*
  - Štand: ${ chosen.booth || ":x:" }
  - Talk: ${ has(chosen.talk) }
  - Workshop: ${ has(chosen.workshop) }
  - Panel: ${ has(chosen.panel) }
  - Koktel: ${ has(chosen.cocktail) }
-------------------------
`;

    const channel =
      ("production" === process.env.NODE_ENV)
        ? "#prijave"
        : "#prijave-test"
    ;

    return this.sendPayload({
      username: "Job Fair Prijavljivator",
      channel,
      text,
    });
  }

  private static sendPayload(
    {
      text,
      channel,
      username = "Job Fair Notifikatizaor",
      iconUrl = "https://jobfair.fer.unizg.hr/icon.png",
      iconEmoji = null,
    }: {
      text: string,
      channel: string,
      username?: string,
      iconUrl?: string,
      iconEmoji?: string | null,
    },
  ): Promise<boolean> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      return Promise.resolve(false);
    }

    const object = {
      text,
      channel,
      username,
      iconUrl,
      iconEmoji,
    } as const;

    const payload = piped(
      object,
      (object) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        deepMap(
          ({ key, value }) => ({
            key:
              isString(key)
                ? snakeCase(key)
                : key,
            value,
          }),
          object,
        )
      ,
      filter((x) => Boolean(x)),
    );

    return post(webhookUrl, payload).then((x) => "ok" === x);
  }
}
