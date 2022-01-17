<template>
  <span
    v-if="isEditable"
    :aria-busy="isLoading"
    :aria-disabled="isLoading"
    :class="{
      [$style.translatedText]: true,
      [$style.editing]: isEditable,
      [$style.loading]: isLoading,
    }"
    :contenteditable="isEditable && !isLoading"
    :data-placeholder="transKey"
    role="textbox"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
    @input.capture="handleInput"
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
    ) {
      const el = ref<HTMLElement | null>(null);
      const text = ref<string>("");
      const isLoading = ref(false);

      function cleanUpText(textRef: Ref<string>): string {
        const text = unref(textRef);

        const brKey = `|${ Math.random().toString(36).slice(3) }|`;
        const html =
          String(text)
            .trim()
            .replace(/<br>/gi, `${ brKey }br${ brKey }`)
            .replaceAll("\n", `${ brKey }br${ brKey }`)
        ;
        const div = document.createElement("div");
        div.innerHTML = html;

        const eBrKey = brKey.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

        return div.textContent?.replace(RegExp(`${ eBrKey }br${ eBrKey }`, "gi"), "\n").trim() || "";
      }

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

      const isEditable = computed<boolean>(() => translationsStore.isEditable);

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
        isLoading,
        text,
        translatedText,
        handleFocus(e: FocusEvent) {
          const el = e.target as (HTMLElement | null);

          if (!el) {
            return;
          }

          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();

          if (!sel) {
            return;
          }

          sel.removeAllRanges();
          sel.addRange(range);
        },
        async handleBlur() {
          const key = transKey;
          const value = cleanText;

          if (!unref(value)) {
            return;
          }

          isLoading.value = true;
          const response = await updateTranslation({
            key,
            value,
          });
          isLoading.value = false;

          if (!response) {
            return alert("Can't reach server. Please try again.");
          }

          const {
            error,
            errorData,
          } = response;

          if (error) {
            const message =
              errorData
                ? errorData.join("\n")
                : "Something went wrong"
            ;

            return alert(message);
          }

          text.value = "";
        },
        handleClick(event: Event) {
          if (unref(isEditable)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
        },
        handleInput(event: InputEvent) {
          text.value = (event.target as (HTMLElement | null))?.innerText ?? "";
        },
        el,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include/all";

  .translatedText {
    display: contents;
    max-width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .editing {
    line-height: 100%;
    position: relative !important;
    display: inline-flex;
    cursor: text;
    border: 1px dashed $fer-dark-blue !important;
    border-radius: 4px !important;
    box-shadow: 0 0 3px 1px $fer-black, 0 0 1px 1px $fer-white !important;

    &:empty,
    *[data-empty] {

      &::before {
        content: attr(data-placeholder);
        opacity: .5;
      }
    }

    .textarea {
      display: inline;
      color: inherit;
      background: transparent;
    }
  }

  .loading {
    display: inline-flex;
    user-select: none;
    pointer-events: none;

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      content: "";
      opacity: 1;
      background-color: color.adjust($fer-black, $alpha: -.31);
    }

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      content: "";
      animation-name: spin;
      animation-duration: 1s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      color: $fer-white;

      // noinspection CssUnknownTarget
      background: url("@/assets/images/util/loading.svg?url") no-repeat center center / contain;
      background-size: min(100%, 2rem) min(100%, 2rem);
      filter: invert(1);

      @keyframes spin {

        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }

      }
    }
  }
</style>
