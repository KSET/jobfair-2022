<template>
  <app-max-width-container>
    Participants :)
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageParticipants",

    components: {
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("participants.header");
    },
  });
</script>
