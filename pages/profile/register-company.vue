<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    defineComponent,
    navigateTo,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageRegisterCompanyHandler",

    setup() {
      const userStore = useUserStore();

      if (userStore.isLoggedIn && userStore.hasCompany) {
        void navigateTo({ name: "profile-me" }, { replace: true });
      }
    },
  });
</script>
