<template>
  <div style="display: contents;">
    <NuxtPage
      v-if="isKSET"
    />
    <page-not-found
      v-else
    />
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import {
    useUserStore,
  } from "~/store/user";
  import PageNotFound from "~/components/page-not-found.vue";

  export default defineComponent({
    name: "AdminRouteHandler",

    components: {
      PageNotFound,
    },

    setup() {
      const userStore = useUserStore();

      return {
        isKSET: computed(() => userStore.user?.email.endsWith("@kset.org")),
      };
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
