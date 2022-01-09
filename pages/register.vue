<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="register.header" />
    </h1>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageRegister",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("register.header");
    },
  });
</script>
