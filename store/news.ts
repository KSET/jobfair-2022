import {
  kebabCase,
} from "lodash-es";
import {
  defineStore,
} from "pinia";
import type {
  News,
} from "~/helpers/news";
import {
  processNewsItem,
} from "~/helpers/news";

export const useNewsStore = defineStore(
  "news",
  {
    state: () => ({
      items: [],
    }),

    actions: {
      async fetchNews() {
        await Promise.all([
          Promise.resolve(),
          // new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);

        const news = [
          {
            date: new Date("09-04-2020"),
            title: "Ostajemo doma: Otkazan ovogodišnji Job Fair",
            description: "Šok i vjeverica! S obzirom na neizvjesnost razvoja situacije s virusom COVID-19 te sukladno smjernicama Nacionalnog stožera civilne zaštite i Vlade Republike Hrvatske.",
          },
          {
            date: new Date("09-04-2020"),
            title: "Budi IN na LinkedInu za 15. Job Fair!",
            description: "Dok marljivo pripremaš svoj životopis za bazu životopisa koja je odnedavno otvorena, želimo ti približiti još jedan način kako se dodatno možeš  istaknuti na 15. JobFairu.",
          },
          {
            date: new Date("09-04-2020"),
            title: "Time to shine - baza životopisa za 15. Job Fair službeno je otvorena!",
            description: "Pripremi se - lov na karijere uskoro počinje! Ovogodišnji Job Fair, koji će se održati 13. i 14. svibnja na  Fakultetu elektrotehnike i računarstva donosi mnogo poslovnih prilika!",
          },
        ].map((item, i) => ({
          ...item,
          slug: kebabCase(item.title),
          images: {
            thumb: {
              url: `https://placeimg.com/${ 80 + i }/${ 80 + i }/tech`,
              width: 80 + i,
            },
            default: {
              url: `https://placeimg.com/${ 1280 + i }/${ 720 + i }/tech`,
              width: 720 + i,
            },
          },
        }) as News);

        return Array.from({ length: 12 }, (_, i) => news[i % news.length]).map(processNewsItem);
      },
    },
  },
);
