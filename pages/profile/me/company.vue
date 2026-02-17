<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    defineComponent,
    navigateTo,
    onMounted,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageProfileCompanyHandler",

    setup() {
      const userStore = useUserStore();

      onMounted(async () => {
        if (userStore.isLoggedIn && !userStore.hasCompany) {
          await navigateTo({ name: "profile-me" }, { replace: true });
        }
      });
    },
  });
</script>
