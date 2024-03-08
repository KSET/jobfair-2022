import {
  type ApplicationTalkCategory,
  type ApplicationTalk,
  type Company,
  type Industry,
  type Season,
  type User,
  type ApplicationWorkshop,
  type ApplicationPresenter,
  type CompanyApplicationContactPerson,
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

const PUBLIC_BASE_URL = process.env.PUBLIC_URL;
const WEBHOOK_URL = process.env.MATTERMOST_WEBHOOK_URL;
const IS_PRODUCTION = "production" === process.env.NODE_ENV;

export default class MattermostNotificationService {
  static notifyOfNewCompany(
    company: Company & { industry: Industry, },
    creator: User,
  ) {
    const text = `
# NOVO PODUZEĆE :sparkles:
-------------------------
### Poduzeće
| - | - |
|----|----|
| Ime | ${ company.brandName } |
| Pravno ime | ${ company.legalName } |
| Stranica | ${ company.website } |
| Industrija | ${ company.industry.name } |

### Kontakt
| - | - |
|----|----|
| Ime | ${ creator.firstName } ${ creator.lastName } |
| Email | ${ creator.email } |
| Broj | ${ creator.phone } |


[Link na firmu :house:](${ PUBLIC_BASE_URL }/admin/companies/${ company.vat }/edit)>
`;

    const channel =
      IS_PRODUCTION
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
    contactPerson: Pick<CompanyApplicationContactPerson, "name" | "email" | "phone">,
    chosen: {
      booth?: string | null,
      talk: boolean | null | Pick<ApplicationTalk, "titleHr" | "titleEn" | "descriptionHr" | "descriptionEn" | "language"> & {
        category: Pick<ApplicationTalkCategory, "name">,
        presenters: Pick<ApplicationPresenter, "firstName" | "lastName">[],
      },
      workshop: boolean | null | Pick<ApplicationWorkshop, "titleHr" | "titleEn" | "descriptionHr" | "descriptionEn" | "language" | "notesHr" | "notesEn" | "goal"> & {
        presenters: Pick<ApplicationPresenter, "firstName" | "lastName">[],
      },
      panel: boolean,
      cocktail: boolean,
    },
  ) {
    const has = (bool: unknown) => bool ? ":white_check_mark:" : ":x:";

    let text = `
# NOVA PRIJAVA :tada:

### :sparkles: [${ company.brandName }](${ PUBLIC_BASE_URL }/admin/companies/${ company.vat }/edit) :sparkles:

#### Kontakt osoba
**${ contactPerson.name }** | [${ contactPerson.email }](mailto:${ encodeURIComponent(`${ contactPerson.name } <${ contactPerson.email }>`) }) | [${ contactPerson.phone }](tel:${ encodeURIComponent(contactPerson.phone) })

#### Odabrano
| - | - |
|----|----|
| Štand | ${ chosen.booth || ":x:" } |
| Talk | ${ has(chosen.talk) } |
| Workshop | ${ has(chosen.workshop) } |
| Panel | ${ has(chosen.panel) } |
| Koktel | ${ has(chosen.cocktail) } |


[Link na prijavu :pray:](${ PUBLIC_BASE_URL }/admin/season/${ season.uid }/applications/${ company.uid }/edit)
`;

    let card = "";

    if (chosen.talk && "object" === typeof chosen.talk) {
      card += `
### :book: TALK :book:
| - | - |
|----|----|
| Naslov | ${ chosen.talk.titleHr } |
| Kategorija | ${ chosen.talk.category.name } |
| Opis | ${ chosen.talk.descriptionHr } |
| Jezik | ${ chosen.talk.language } |
| Predavač/ica | ${ chosen.talk.presenters.map((p) => `${ p.firstName } ${ p.lastName }`).join(", ") } |
`;
    }

    if (chosen.workshop && "object" === typeof chosen.workshop) {
      card += `
### :computer: WORKSHOP :computer:
| - | - |
|----|----|
| Naslov | ${ chosen.workshop.titleHr } |
| Opis | ${ chosen.workshop.descriptionHr } |
| Jezik | ${ chosen.workshop.language } |
| Predavač/ica | ${ chosen.workshop.presenters.map((p) => `${ p.firstName } ${ p.lastName }`).join(", ") } |
`;
    }

    if (card) {
      text += `

Informacije o komponentama u info kartici (mali sivi \`(i)\` pored imena bota)
`;
    }

    const channel =
      IS_PRODUCTION
        ? "#prijave"
        : "#prijave-test"
    ;

    return this.sendPayload({
      username: "Job Fair Prijavljivator",
      channel,
      text,
      props: {
        card,
      },
    });
  }

  private static sendPayload(
    {
      text,
      channel,
      username = "Job Fair Notifikatizaor",
      iconUrl = "https://jobfair.fer.unizg.hr/icon.png",
      iconEmoji = null,
      props = {},
      attachments = [],
    }: {
      text: string,
      channel: string,
      username?: string,
      iconUrl?: string,
      iconEmoji?: string | null,
      props?: Record<string, unknown> & {
        card?: string,
      },
      attachments?: {
        fallback: string,
        color?: string,
        pretext?: string,
        text?: string,
        authorName?: string,
        authorLink?: string,
        authorIcon?: string,
        title?: string,
        titleLink?: string,
        fields?: {
          short: boolean,
          title: string,
          value: string,
        }[],
        imageUrl?: string,
        footer?: string,
        footerIcon?: string,
      }[],
    },
  ): Promise<boolean> {
    if (!WEBHOOK_URL) {
      return Promise.resolve(false);
    }

    const object = {
      text,
      channel,
      username,
      iconUrl,
      iconEmoji,
      props,
      attachments,
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
      filter(Boolean),
    );

    return post(WEBHOOK_URL, payload).then((x) => "ok" === x);
  }
}
