<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    defineComponent,
    unref,
    useRouter,
  } from "#imports";
  import {
    useUserStore,
  } from "~/store/user";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";

  export default defineComponent({
    name: "PageProfileHandler",

    async setup() {
      const router = useRouter();
      const userStore = useUserStore();
      const joinNowRoute = useJoinNowRoute();

      if (userStore.isLoggedIn) {
        return;
      }

      await router.push(unref(joinNowRoute));
    },
  });
</script>
