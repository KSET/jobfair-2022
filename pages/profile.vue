<template>
  <nuxt-nested-page
    v-if="isLoggedIn"
  />
  <page-not-found
    v-else
  />
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
    name: "PageProfileHandler",

    components: {
      PageNotFound,
    },

    setup() {
      const userStore = useUserStore();

      const isLoggedIn = computed(() => userStore.isLoggedIn);

      return {
        isLoggedIn,
      };
    },
  });
</script>
