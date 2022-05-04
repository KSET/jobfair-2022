import {
 defineStore,
} from "pinia";

export const usePagesStore = defineStore(
  "pages",
  {
    state: () => ({
      pages: [
        {
          name: "page.name.home",
          to: { name: "index" },
        },
        {
          name: "page.name.news",
          to: { name: "news" },
        },
        {
          name: "page.name.schedule",
          to: { name: "schedule" },
        },
        {
          name: "page.name.about",
          to: { name: "about" },
        },
        {
          name: "page.name.contact",
          to: { name: "contact" },
        },
        {
          name: "page.name.press",
          to: { name: "press" },
        },
      ],
    }),
  },
);
