<template>
  <div style="display: contents;">
    <NuxtPage
      v-if="isLoggedIn"
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
  import {
    onBeforeMount,
    unref,
    useRouter,
  } from "#imports";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";

  export default defineComponent({
    name: "PageProfileHandler",

    components: {
      PageNotFound,
    },

    setup() {
      const router = useRouter();
      const userStore = useUserStore();
      const joinNowRoute = useJoinNowRoute();

      const isLoggedIn = computed(() => userStore.isLoggedIn);

      onBeforeMount(() => {
        if (unref(isLoggedIn)) {
          return;
        }

        return router.push(unref(joinNowRoute));
      });

      return {
        isLoggedIn,
      };
    },
  });
</script>
