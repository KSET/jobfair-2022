<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    createError,
    defineComponent,
  } from "#imports";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageProfileCompanyFeedbackHandler",

    async setup() {
      const companyStore = useCompanyStore();

      await companyStore.fetchCurrentApplication();

      if (!companyStore.hasApplication) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
