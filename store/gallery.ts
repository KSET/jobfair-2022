import {
  defineStore,
} from "pinia";

export const useGalleryStore = defineStore(
    "gallery",
    {
      state: () => ({
        items: Array.from(
          { length: 6 },
          (_, i) => ({
            url: `/tmp/gallery/${ i + 1 }.jpg`,
          }),
        ),
      }),
    },
  )
;
