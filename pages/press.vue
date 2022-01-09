<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="press.header" />
    </h1>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    name: "PagePress",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("press.header");
    },
  });
</script>
