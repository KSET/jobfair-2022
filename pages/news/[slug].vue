<template>
  <app-max-width-container>
    News :)
    <pre v-text="$route.params" />
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";

  export default defineComponent({
    name: "NewsPage",

    components: {
      AppMaxWidthContainer,
    },
  });
</script>
