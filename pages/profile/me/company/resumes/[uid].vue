<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    createError,
    defineComponent,
    useRoute,
  } from "#imports";
  import {
    useResumeStore,
  } from "~/store/resume";

  export default defineComponent({
    name: "PageResumeDataFlow",

    async setup() {
      const route = useRoute();
      const resumeStore = useResumeStore();

      await resumeStore.fetchResumeFor(route.params.uid as string);

      if (!resumeStore.resume) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
