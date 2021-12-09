<template>
  <div>
    News :)
    <pre v-text="$route.params" />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";

  export default defineComponent({
    name: "NewsPage",
  });
</script>
