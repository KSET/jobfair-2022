<template>
  <NuxtPage v-if="isLoggedIn" />
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
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

    setup() {
      const userStore = useUserStore();
      const joinNowRoute = useJoinNowRoute();

      onMounted(async () => {
        if (userStore.isLoggedIn) {
          return;
        }

        await navigateTo(unref(joinNowRoute));
      });

      return {
        isLoggedIn: computed(() => userStore.isLoggedIn),
      };
    },
  });
</script>
