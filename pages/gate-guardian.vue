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

      const isKset = userStore.user?.email.endsWith("@kset.org");

      if (!isKset) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100vw;

    .loadingContainer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;

      h1 {
        align-self: center;
        flex: 1;
        text-align: center;
      }
    }

    video {
      align-self: center;
      width: 100vw;
    }

    .widgets {
      position: absolute;
      bottom: 0;
      left: 0;
      padding: .5rem;
      color: $fer-white;
      background-color: rgb(0 0 0 / 50%);
    }
  }
</style>
