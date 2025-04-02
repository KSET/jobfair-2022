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
    start: Date = new Date("2022-05-03T17:26:50.810Z");

  @Field()
    end: Date = new Date("2022-05-03T17:26:50.810Z");

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
    start: "2023-05-17 10:00",
    end: "2023-05-17 10:30",
    title: "dSPACE",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 10:30",
    end: "2023-05-17 11:00",
    title: "atma",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-17 11:00",
    end: "2023-05-17 11:30",
    title: "Fraunhoffer",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 11:30",
    end: "2023-05-17 12:00",
    title: "Photomath",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-17 12:00",
    end: "2023-05-17 12:30",
    title: "Freshbooks",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 12:30",
    end: "2023-05-17 13:00",
    title: "Prenhit",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-17 14:00",
    end: "2023-05-17 14:30",
    title: "Undabot",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 14:30",
    end: "2023-05-17 15:00",
    title: "Ericsson Nikola Tesla",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-17 15:00",
    end: "2023-05-17 15:30",
    title: "Devot",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 15:30",
    end: "2023-05-17 16:00",
    title: "CROZ",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-17 16:00",
    end: "2023-05-17 16:30",
    title: "Secuirtas",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-17 16:30",
    end: "2023-05-17 17:00",
    title: "Span",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
];
const talks2 = [
  {
    start: "2023-05-18 10:00",
    end: "2023-05-18 10:30",
    title: "KONČAR D&ST",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 10:30",
    end: "2023-05-18 11:00",
    title: "Happening",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-18 11:00",
    end: "2023-05-18 11:30",
    title: "Valcon",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 11:30",
    end: "2023-05-18 12:00",
    title: "minus5",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-18 12:00",
    end: "2023-05-18 12:30",
    title: "CETITEC",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 12:30",
    end: "2023-05-18 13:00",
    title: "KONČAR - Institut za elektrotehniku",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-18 14:00",
    end: "2023-05-18 14:30",
    title: "Montelektro",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 14:30",
    end: "2023-05-18 15:00",
    title: "Infinum",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-18 15:00",
    end: "2023-05-18 15:30",
    title: "Barrage",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 15:30",
    end: "2023-05-18 16:00",
    title: "Privredna Banka Zagreb",
    class: "talk",
    location: "Zagrebački Velesajam",
  },

  {
    start: "2023-05-18 16:00",
    end: "2023-05-18 16:30",
    title: "Infobip",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
  {
    start: "2023-05-18 16:30",
    end: "2023-05-18 17:00",
    title: "Deegloo",
    class: "talk",
    location: "Zagrebački Velesajam",
  },
];
const talks = [
  ...talks1,
  ...talks2,
];

const workshops1 = [
  {
    start: "2023-05-17 10:00",
    end: "2023-05-17 12:00",
    title: "Undabot",
    class: "workshop",
    location: "FER - A111",
  },
  {
    start: "2023-05-17 13:00",
    end: "2023-05-17 15:00",
    title: "Comsysto Reply",
    class: "workshop",
    location: "FER - A111",
  },
  {
    start: "2023-05-17 16:00",
    end: "2023-05-17 18:00",
    title: "Ericsson Nikola Tesla",
    class: "workshop",
    location: "FER - A111",
  },

  {
    start: "2023-05-17 10:00",
    end: "2023-05-17 12:00",
    title: "Huddle",
    class: "workshop",
    location: "FER - A201",
  },
  {
    start: "2023-05-17 13:00",
    end: "2023-05-17 15:00",
    title: "Ars Futura",
    class: "workshop",
    location: "FER - A201",
  },
  {
    start: "2023-05-17 16:00",
    end: "2023-05-17 18:00",
    title: "Njuškalo",
    class: "workshop",
    location: "FER - A201",
  },

  {
    start: "2023-05-17 10:00",
    end: "2023-05-17 12:00",
    title: "Byte Lab",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },
  {
    start: "2023-05-17 13:00",
    end: "2023-05-17 15:00",
    title: "Happening",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },
  {
    start: "2023-05-17 16:00",
    end: "2023-05-17 18:00",
    title: "SysKit",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },
];
const workshops2 = [
  {
    start: "2023-05-18 10:00",
    end: "2023-05-18 12:00",
    title: "CROZ",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },
  {
    start: "2023-05-18 13:00",
    end: "2023-05-18 15:00",
    title: "IMC Trading",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },
  {
    start: "2023-05-18 16:00",
    end: "2023-05-18 18:00",
    title: "ReversingLabs",
    class: "workshop",
    location: "FER - Bijela vijećnica",
  },

  {
    start: "2023-05-18 10:00",
    end: "2023-05-18 12:00",
    title: "Photomath",
    class: "workshop",
    location: "FER - A211",
  },
  {
    start: "2023-05-18 13:00",
    end: "2023-05-18 15:00",
    title: "Blockhouse Technology",
    class: "workshop",
    location: "FER - A211",
  },
  {
    start: "2023-05-18 16:00",
    end: "2023-05-18 18:00",
    title: "Valcon",
    class: "workshop",
    location: "FER - A211",
  },
  
  {
    start: "2023-05-18 10:00",
    end: "2023-05-18 12:00",
    title: "Televend by Intis",
    class: "workshop",
    location: "FER - A111",
  },
  {
    start: "2023-05-18 13:00",
    end: "2023-05-18 15:00",
    title: "Aircash",
    class: "workshop",
    location: "FER - A111",
  },
  {
    start: "2023-05-18 16:00",
    end: "2023-05-18 18:00",
    title: "CS Computer Systems",
    class: "workshop",
    location: "FER - A111",
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
    start: "2023-05-17 13:00",
    end: "2023-05-17 14:00",
    title: "Panel rasprava",
    class: "panel",
    location: "Zagrebački Velesajam",
    noGroup: true,
  },
  {
    start: "2023-05-18 13:00",
    end: "2023-05-18 14:00",
    title: "Hot Talk",
    class: "hot-talk",
    location: "Zagrebački Velesajam",
    noGroup: true,
  },
  {
    start: "2023-05-17 18:00",
    end: "2023-05-17 20:00",
    title: "Loosen Up party",
    class: "loosen-up",
    location: "KSET",
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
  calendarOld(): GQLResponse<CalendarEvent[]> {
    return Promise.resolve(events);
  }
}
