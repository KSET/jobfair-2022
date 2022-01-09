<template>
  <app-max-width-container>
    <translated-text trans-key="participants.header" />
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
    name: "PageParticipants",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("participants.header");
    },
  });
</script>
