<template>
  <page-not-found />
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import PageNotFound from "~/components/page-not-found.vue";

  export default defineComponent({
    name: "Page404NotFound",

    components: {
      PageNotFound,
    },
  });
</script>
