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
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageCompanyContainer",

    async setup() {
      const route = useRoute();
      const companyStore = useCompanyStore();

      const company = await companyStore.fetchCompanyInfo(route.params.uid as string);

      if (!company) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
