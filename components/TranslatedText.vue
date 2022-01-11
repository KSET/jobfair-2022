<template>
  <span
    v-if="isEditable"
    ref="$el"
    :class="{
      [$style.translatedText]: true,
      [$style.editing]: isEditable,
    }"
    :contenteditable="isEditable"
    @blur="handleBlur"
    @click="handleClick"
    @input="text = $event.target.innerText"
  >
    {{ translatedText }}
  </span>
  <span
    v-else
    :class="$style.translatedText"
    v-text="translatedText"
  />
</template>

<script lang="ts">
  import type {
    Ref,
    } from "vue";
  import {
    computed,
    defineComponent,
    onMounted,
    ref,
    toRefs,
    unref,
    watch,
  } from "vue";
  import {
    MaybeRef,
  } from "@vueuse/shared";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  type Props = {
    transKey: string,
  };

  export default defineComponent({
    name: "TranslatedText",

    props: {
      transKey: {
        required: true,
        type: String,
      },

      modelValue: {
        required: false,
        type: String,
        default: "",
      },
    },

    emits: [
      "update:modelValue",
    ],

    setup(
      props: Props,
      { emit },
    ): unknown {
      const el = ref<HTMLElement | null>(null);

      const text = ref<string>("");

      const translation = computed(() => {
        const el$ = unref(el);

        if (null === el$) {
          return unref(cleanText);
        }

        return unref(cleanText) || cleanUpText(ref(el$.innerHTML));
      });

      onMounted(() => {
        text.value = unref(translation);
      });

      function cleanUpText(textRef: Ref<string>): string {
        const text = unref(textRef);

        const brKey = `|${ Math.random().toString(36).slice(3) }|`;
        const html = String(text).trim().replace(/<br>/gi, `${ brKey }br${ brKey }`);
        const div = document.createElement("div");
        div.innerHTML = html;

        const eBrKey = brKey.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

        return div.textContent?.replace(RegExp(`${ eBrKey }br${ eBrKey }`, "gi"), "<br>") || "";
      }

      const translationsStore = useTranslationsStore();

      const cleanText = computed(() => cleanUpText(text));
      const { transKey } = toRefs(props);
      const updateTranslation =
        (
          {
            key,
            value,
          }: {
            key: MaybeRef<string>,
            value: MaybeRef<string>,
          },
        ) =>
          translationsStore
            .updateTranslation({
              key: unref(key),
              value: unref(value),
            })
      ;

      async function handleBlur() {
        const key = transKey;
        const value = cleanText;

        if (!value) {
          return;
        }

        const {
          error,
          errorData,
        } = await updateTranslation({
          key,
          value,
        });

        if (error) {
          const message =
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          return alert(message);
        }

        text.value = "";
      }

      const isEditable = computed<boolean>(() => translationsStore.isEditable);

      function handleClick(event: Event) {
        if (isEditable) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }

      const translate = computed(() => translationsStore.translation);
      const translatedText = computed(() => unref(translate)(unref(transKey)));

      watch(
        text,
        () => {
          emit("update:modelValue", unref(translatedText));
        },
        {
          immediate: true,
        },
      );

      return {
        isEditable,
        text,
        translatedText,
        handleBlur,
        handleClick,
        el,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .translatedText {
    max-width: 100%;
    word-break: break-word;
    display: contents;
  }

  .editing {
    position: relative !important;
    display: inline-flex;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 1em !important;
    border: 1px dashed $fer-dark-blue !important;
    border-radius: 4px !important;
    box-shadow: 0 0 3px 1px $fer-black, 0 0 1px 1px $fer-white !important;

    &:empty,
    *[data-empty] {

      &::after {
        content: attr(data-placeholder);
        opacity: .5;
      }
    }
  }
</style>
