import {
  generateMetadata,
  generateTitle,
} from "~/helpers/head";
import {
  type Assign,
  type MaybeComputedRef,
} from "~/helpers/type";
import {
  computed,
  unref,
  useHead,
} from "#imports";
import {
  useTranslationsStore,
} from "~/store/translations";

type ColorScheme = "normal" | "light" | "dark" | "only light";

type HeadMetadataBase = {
  title: string,
  description: string,
  keywords: string,
  icon: string,
  themeColor: string,
  colorScheme: ColorScheme,
};

type HeadMetadataArticle = Assign<HeadMetadataBase, {
  type: "article",
  "article:published_time": string | Date,
  "article:modified_time": string | Date,
  "article:expiration_time": string | Date,
  "article:author": string,
}>;

export type HeadMetadata = HeadMetadataBase | HeadMetadataArticle;

const unrefComputed = <T>(ref: MaybeComputedRef<T>) => unref(ref);

export const useHeadMetadata = <T extends Partial<HeadMetadata>>(metaRef: MaybeComputedRef<T>, translateTitle = true) => {
  const translationStore = useTranslationsStore();

  const title = computed(
    () => {
      const meta = unrefComputed(metaRef);
      const {
        title,
      } = meta;

      return (
        title && translateTitle
          ? translationStore.capitalizedTranslation(title)
          : title
      );
    },
  );

  const head = computed(() => {
    const maybeTitle = unrefComputed(title);
    const meta = unrefComputed(metaRef);

    if (maybeTitle) {
      meta.title = maybeTitle;

      return {
        title: generateTitle(meta.title),
        meta: generateMetadata(meta),
      };
    }

    return {
      meta: generateMetadata(meta),
    };
  });

  useHead(head);
};
