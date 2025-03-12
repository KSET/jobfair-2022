import {
 defineStore,
} from "pinia";
import type {
 GalleryImage,
} from "~/graphql/client/graphql";

export const useGalleryStore = defineStore("gallery", {
  state: () => ({
    items: Array.from({ length: 6 }, (_, i) => ({
      url: `/tmp/gallery/${ i + 1 }.jpg`,
    })),
  }),

  actions: {
    setGalleryImages<T extends GalleryImage>(data: T[]) {
      this.items = data.map((item: T) => ({
        url: item?.photo?.fullUrl ?? "/tmp/gallery/1.jpg",
      }));
    },
  },
});
