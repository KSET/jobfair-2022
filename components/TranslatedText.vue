<template>
  <translated-text-editor
    v-if="isEditable"
    :trans-key="transKey"
  />
  <span
    v-else
    :class="$style.translatedText"
    v-text="translatedText"
  />
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    unref,
    watch,
  } from "vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import TranslatedTextEditor from "~/components/translation/translated-text-editor.vue";

  type Props = {
    transKey: string,
  };

  export default defineComponent({
    name: "TranslatedText",

    components: {
      TranslatedTextEditor,
    },

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
      const translationsStore = useTranslationsStore();

      const translatedText = computed(() => translationsStore.translation(props.transKey));
      watch(
        translatedText,
        () => {
          emit("update:modelValue", unref(translatedText));
        },
        {
          immediate: true,
        },
      );

      return {
        translatedText,
        isEditable: computed(() => translationsStore.isEditable),
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .translatedText {
    display: contents;
    max-width: 100%;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
