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
          name: "page.name.blog",
          to: { name: "blog" },
        },
        {
          name: "page.name.about",
          to: { name: "about" },
        },
        {
          name: "page.name.participants",
          to: { name: "participants" },
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
