<template>
  <nuxt-nested-page v-if="resumeExists" />
  <page-not-found v-else />
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    useRoute,
  } from "#imports";
  import {
    useResumeStore,
  } from "~/store/resume";
  import PageNotFound from "~/components/page-not-found.vue";

  export default defineComponent({
    name: "PageResumeDataFlow",

    components: {
      PageNotFound,
    },

    async setup() {
      const route = useRoute();
      const resumeStore = useResumeStore();

      await resumeStore.fetchResumeFor(route.params.uid as string);

      return {
        resumeExists: computed(() => Boolean(resumeStore.resume)),
      };
    },
  });
</script>
