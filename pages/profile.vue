<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    defineComponent,
    unref,
    navigateTo,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useJoinNowRoute,
  } from "~/composables/useJoinNowRoute";

  export default defineComponent({
    name: "PageProfileHandler",

    async setup() {
      const userStore = useUserStore();
      const joinNowRoute = useJoinNowRoute();

      if (userStore.isLoggedIn) {
        return;
      }

      await navigateTo(unref(joinNowRoute));
    },
  });
</script>
