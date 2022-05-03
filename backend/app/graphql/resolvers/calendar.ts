import {
  Field,
  ObjectType,
  Query,
} from "type-graphql";
import {
  GQLResponse,
} from "../../types/helpers";

@ObjectType()
class CalendarEvent {
  @Field()
    start: Date = new Date();

  @Field()
    end: Date = new Date();

  @Field()
    title: string = "";

  @Field()
    text: string = "";

  @Field()
    location: string = "";

  @Field()
    class: string = "";

  @Field()
    noGroup: boolean = false;
}

const talks1 = [
  {
    start: "2022-05-11 10:00",
    end: "2022-05-11 10:30",
    title: "Ericsson",
    class: "talk",
  },
  {
    start: "2022-05-11 10:30",
    end: "2022-05-11 11:00",
    title: "Syntio",
    class: "talk",
  },

  {
    start: "2022-05-11 11:00",
    end: "2022-05-11 11:30",
    title: "Memgraph",
    class: "talk",
  },
  {
    start: "2022-05-11 11:30",
    end: "2022-05-11 12:00",
    title: "KONČAR",
    class: "talk",
  },

  {
    start: "2022-05-11 12:00",
    end: "2022-05-11 12:30",
    title: "Srce",
    class: "talk",
  },
  {
    start: "2022-05-11 12:30",
    end: "2022-05-11 13:00",
    title: "RealNetworks",
    class: "talk",
  },

  {
    start: "2022-05-11 14:00",
    end: "2022-05-11 14:30",
    title: "Ingemark",
    class: "talk",
  },
  {
    start: "2022-05-11 14:30",
    end: "2022-05-11 15:00",
    title: "A1",
    class: "talk",
  },

  {
    start: "2022-05-11 15:00",
    end: "2022-05-11 15:30",
    title: "Trikoder",
    class: "talk",
  },
  {
    start: "2022-05-11 15:30",
    end: "2022-05-11 16:00",
    title: "Microblink",
    class: "talk",
  },

  {
    start: "2022-05-11 16:00",
    end: "2022-05-11 16:30",
    title: "DECODE",
    class: "talk",
  },
  {
    start: "2022-05-11 16:30",
    end: "2022-05-11 17:00",
    title: "Infobip",
    class: "talk",
  },
];
const talks2 = [
  {
    start: "2022-05-12 10:00",
    end: "2022-05-12 10:30",
    title: "mStart",
    class: "talk",
  },
  {
    start: "2022-05-12 10:30",
    end: "2022-05-12 11:00",
    title: "INETEC",
    class: "talk",
  },

  {
    start: "2022-05-12 11:00",
    end: "2022-05-12 11:30",
    title: "Gideon",
    class: "talk",
  },
  {
    start: "2022-05-12 11:30",
    end: "2022-05-12 12:00",
    title: "Ars Futura",
    class: "talk",
  },

  {
    start: "2022-05-12 12:00",
    end: "2022-05-12 12:30",
    title: "Poslovna inteligencija",
    class: "talk",
  },
  {
    start: "2022-05-12 12:30",
    end: "2022-05-12 13:00",
    title: "FIVE",
    class: "talk",
  },

  {
    start: "2022-05-12 14:00",
    end: "2022-05-12 14:30",
    title: "Xylon",
    class: "talk",
  },
  {
    start: "2022-05-12 14:30",
    end: "2022-05-12 15:00",
    title: "Span",
    class: "talk",
  },

  {
    start: "2022-05-12 15:00",
    end: "2022-05-12 15:30",
    title: "Deegloo",
    class: "talk",
  },
  {
    start: "2022-05-12 15:30",
    end: "2022-05-12 16:00",
    title: "minus5",
    class: "talk",
  },

  {
    start: "2022-05-12 16:00",
    end: "2022-05-12 16:30",
    title: "Photomath",
    class: "talk",
  },
  {
    start: "2022-05-12 16:30",
    end: "2022-05-12 17:00",
    title: "Rimac Automobili",
    class: "talk",
  },
];
const talks = [
  ...talks1,
  ...talks2,
];

const workshops1 = [
  {
    start: "2022-05-11 10:00",
    end: "2022-05-11 12:00",
    title: "dSpace",
    class: "workshop",
    location: "FER - A201",
  },
  {
    start: "2022-05-11 13:00",
    end: "2022-05-11 15:00",
    title: "CROZ",
    class: "workshop",
    location: "FER - A201",
  },
  {
    start: "2022-05-11 16:00",
    end: "2022-05-11 18:00",
    title: "SedamIT",
    class: "workshop",
    location: "FER - A201",
  },

  {
    start: "2022-05-11 10:00",
    end: "2022-05-11 12:00",
    title: "Agency04",
    class: "workshop",
    location: "FER - A301",
  },
  {
    start: "2022-05-11 13:00",
    end: "2022-05-11 15:00",
    title: "ALFATEC",
    class: "workshop",
    location: "FER - A301",
  },
  {
    start: "2022-05-11 16:00",
    end: "2022-05-11 18:00",
    title: "Rimac Automobili",
    class: "workshop",
    location: "FER - A301",
  },

  {
    start: "2022-05-11 10:00",
    end: "2022-05-11 12:00",
    title: "True North",
    class: "workshop",
    location: "FER - Bijela",
  },
  {
    start: "2022-05-11 13:00",
    end: "2022-05-11 15:00",
    title: "Greyp",
    class: "workshop",
    location: "FER - Bijela",
  },
  {
    start: "2022-05-11 16:00",
    end: "2022-05-11 18:00",
    title: "CARNET",
    class: "workshop",
    location: "FER - Bijela",
  },
];
const workshops2 = [
  {
    start: "2022-05-12 10:00",
    end: "2022-05-12 12:00",
    title: "Comsysto Reply",
    class: "workshop",
    location: "FER - Bijela",
  },
  {
    start: "2022-05-12 13:00",
    end: "2022-05-12 15:00",
    title: "Undabot",
    class: "workshop",
    location: "FER - Bijela",
  },
  {
    start: "2022-05-12 16:00",
    end: "2022-05-12 18:00",
    title: "Ericsson",
    class: "workshop",
    location: "FER - Bijela",
  },

  {
    start: "2022-05-12 10:00",
    end: "2022-05-12 12:00",
    title: "KONČAR",
    class: "workshop",
    location: "FER - SPOCK",
  },
  {
    start: "2022-05-12 13:00",
    end: "2022-05-12 15:00",
    title: "ByteLab",
    class: "workshop",
    location: "FER - SPOCK",
  },
  {
    start: "2022-05-12 16:00",
    end: "2022-05-12 18:00",
    title: "Ars Futura",
    class: "workshop",
    location: "FER - SPOCK",
  },

  {
    start: "2022-05-12 16:00",
    end: "2022-05-12 18:00",
    title: "Televend by Intis",
    class: "workshop",
    location: "FER - A211",
  },
];
const workshops = [
  ...workshops1,
  ...workshops2,
];

const toIsoDate =
  (date: string) =>
    new Date(
      `${
        date
          .replaceAll(" ", "T")
      }+02:00`
      ,
    )
;

const events = [
  ...talks,
  ...workshops,
  {
    start: "2022-05-11 13:00",
    end: "2022-05-11 14:00",
    title: "Panel",
    class: "panel",
    noGroup: true,
  },
  {
    start: "2022-05-12 13:00",
    end: "2022-05-12 14:00",
    title: "Hot Talk",
    class: "hot-talk",
    noGroup: true,
  },
  {
    start: "2022-05-11 18:00",
    end: "2022-05-11 20:00",
    title: "Loosen Up party",
    class: "loosen-up",
    noGroup: true,
  },
].map((event) => ({
  ...event,
  start: toIsoDate(event.start),
  end: toIsoDate(event.end),
  text: (event as unknown as { text: string | undefined, }).text ?? "",
  noGroup: (event as { noGroup: true | undefined, }).noGroup ?? false,
  location: (event as unknown as { location: string | undefined, }).location ?? "",
}));

export class CalendarMockResolver {
  @Query(() => [ CalendarEvent ])
  calendar(): GQLResponse<CalendarEvent[]> {
    return Promise.resolve(events);
  }
}
