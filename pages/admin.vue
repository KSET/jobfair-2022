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
    name: "AdminRouteHandler",

    setup() {
      const userStore = useUserStore();

      if (!userStore.isAdmin) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>
