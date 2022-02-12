<template>
  <nuxt-nested-page
    v-if="isAdmin"
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
    name: "AdminRouteHandler",

    components: {
      PageNotFound,
    },

    setup() {
      const userStore = useUserStore();

      const isAdmin = computed(() => userStore.isAdmin);

      return {
        isAdmin,
      };
    },
  });
</script>
