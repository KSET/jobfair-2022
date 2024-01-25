// Job Fair

import {
  type MaybeRef,
} from "~/helpers/type";
import {
  unref,
  computed,
  useHeadMetadata,
} from "#imports";

export default function(title: MaybeRef<string>, translate = true) {
  return useHeadMetadata(
    computed(() => ({
      title: unref(title),
    })),
    translate,
  );
}
