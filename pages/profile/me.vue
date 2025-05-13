<template>
  <NuxtPage />
</template>

  <script lang="ts">
  import {
    defineComponent,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageProfileMeHandler",

    async setup() {
      const userStore = useUserStore();
      const companyStore = useCompanyStore();

      if (userStore.hasCompany) {
        await companyStore.fetchCurrentApplication();
      }
    },
  });
  </script>
