<template>
  <span
    :aria-busy="isLoading"
    :aria-disabled="isLoading"
    :class="{
      [$style.translatedText]: true,
      [$style.loading]: isLoading,
    }"
    :contenteditable="!isLoading"
    :data-placeholder="transKey"
    role="textbox"
    @blur="handleBlur"
    @click="handleClick"
    @focus="handleFocus"
    @input.capture="handleInput"
  >
    {{ translatedText }}
  </span>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
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

  function cleanUpText(textRef: MaybeRef<string>): string {
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

  export default defineComponent({
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
    ) {
      const translationsStore = useTranslationsStore();

      const translatedText = computed(() => translationsStore.translation(unref(props.transKey)));
      const text = ref<string>(unref(translatedText));

      watch(translatedText, (value) => {
        text.value = value;
      });

      return {
        isLoading: computed(() => translationsStore.translationLoading(props.transKey)),
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
          const cleanText = cleanUpText(text);

          if (cleanText === unref(translatedText)) {
            return;
          }

          const success = await translationsStore.updateTranslation({
            key: props.transKey,
            value: cleanText,
          });

          if (!success) {
            return alert("Something went wrong. Please try again.");
          }
        },
        handleClick(event: Event) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return false;
        },
        handleInput(event: InputEvent) {
          text.value = (event.target as (HTMLElement | null))?.innerText ?? "";
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include/all";

  .translatedText {
    line-height: 100%;
    position: relative !important;
    display: inline-flex !important;
    max-width: 100%;
    cursor: text;
    white-space: pre-wrap;
    word-break: break-word;
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
