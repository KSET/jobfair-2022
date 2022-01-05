<template>
  <app-max-width-container>
    Press :)
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PagePress",

    components: {
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("press.header");
    },
  });
</script>
