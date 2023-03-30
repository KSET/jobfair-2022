<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    createError,
    defineComponent,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageRegisterCompanyHandler",

    setup() {
      const userStore = useUserStore();

      if (userStore.hasCompany) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
