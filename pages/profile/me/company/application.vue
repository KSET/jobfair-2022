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
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  export default defineComponent({
    name: "PageProfileCompanyApplicationHandler",

    async setup() {
      const companyStore = useCompanyStore();
      const seasonsStore = useSeasonsStore();

      await companyStore.fetchCurrentApplication();

      const hasApplication = Boolean(companyStore.applicationInfo?.companyApplication);
      const applicationsEditable = seasonsStore.areApplicationsEditable;

      if (!hasApplication || !applicationsEditable) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
