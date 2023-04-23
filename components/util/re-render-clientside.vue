<template>
  <slot :key="mounted" />
</template>

<script setup lang="ts">
  import {
    ref,
    onMounted,
  } from "#imports";

  const mounted = ref(0);

  onMounted(() => {
    mounted.value = 1;
  });
</script>

<style module>
  .container {
    display: contents;
  }
</style>
