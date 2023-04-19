// Job Fair
import {
  computed,
  unref,
} from "vue";
import {
  MaybeRef,
} from "~/helpers/type";
import {
  useTranslationsStore,
} from "~/store/translations";
import {
  useHead,
} from "#imports";
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

  useHead({
    title: computed(() => generateTitle(unref(translation))),
    meta: computed(() => generateMetadata({
      title: unref(translation),
    })),
  });
}
