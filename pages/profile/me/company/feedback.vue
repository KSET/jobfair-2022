<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    createError,
    defineComponent,
  } from "#imports";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageProfileCompanyFeedbackHandler",

    async setup() {
      const seasonsStore = useSeasonsStore();
      const companyStore = useCompanyStore();

      await companyStore.fetchCurrentApplication();

      if (!seasonsStore.isFeedbackOpen || !companyStore.hasApplication) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
