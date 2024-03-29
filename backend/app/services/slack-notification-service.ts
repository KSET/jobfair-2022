import {
  Company,
  Industry,
  Season,
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

type CurrentSeason = Pick<Season, "uid">;

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
    season: CurrentSeason,
    creator: User,
    chosen: {
      booth?: string | null,
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
  - Prijavio/la: <mailto:${ creator.email }|${ creator.firstName } ${ creator.lastName }>

*Odabrano*
  - Štand: _${ chosen.booth || ":x:" }_
  - Talk: ${ has(chosen.talk) }
  - Workshop: ${ has(chosen.workshop) }
  - Panel: ${ has(chosen.panel) }
  - Koktel: ${ has(chosen.cocktail) }

<https://jobfair.fer.unizg.hr/admin/season/${ season.uid }/applications/${ company.uid }/edit|Link na prijavu :pray:>
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
