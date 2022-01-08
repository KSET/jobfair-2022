// Job Fair
import {
  computed,
  unref,
} from "vue";
import type {
  MaybeRef,
} from "@vueuse/shared";
import {
  useTranslationsStore,
} from "~/store/translations";
import {
  useMeta,
} from "#meta";
import {
  generateMetadata,
  generateTitle,
} from "~/helpers/head";

export default function(title: MaybeRef<string>, translate = true) {
  const translationStore = useTranslationsStore();

  const translation = computed(
    () =>
      translate
        ? translationStore.capitalizedTranslation(unref(title))
        : unref(title)
    ,
  );

  useMeta({
    title: computed(() => generateTitle(unref(translation))),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    meta: computed(() => generateMetadata({
      title: unref(translation),
    })),
  });
}
