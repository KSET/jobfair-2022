<template>
  <app-max-width-container>
    Contact :)
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";

  export default defineComponent({
    name: "PageContact",

    components: {
      AppMaxWidthContainer,
    },
  });
</script>
