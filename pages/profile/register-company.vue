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

      // Only check if user is logged in - don't block unauthenticated users
      // (parent profile.vue will handle login redirect)
      if (userStore.isLoggedIn && userStore.hasCompany) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
