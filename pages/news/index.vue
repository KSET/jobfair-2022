<template>
  <app-max-width-container>
    Blog :)
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";

  export default defineComponent({
    name: "PageBlog",

    components: {
      AppMaxWidthContainer,
    },
  });
</script>