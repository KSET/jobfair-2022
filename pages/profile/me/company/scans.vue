<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
  import {
    createError,
    defineComponent,
  } from "#imports";
  import {
    useCompanyStore,
  } from "~/store/company";

  const companyStore = useCompanyStore();

  await companyStore.fetchCurrentApplication();

  if (!companyStore.hasApplication) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }
</script>
