<template>
  <div style="display: contents;">
    <nuxt-nested-page
      v-if="hasApplication"
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
  import PageNotFound from "~/components/page-not-found.vue";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageProfileCompanyApplicationHandler",

    components: {
      PageNotFound,
    },

    async setup() {
      const companyStore = useCompanyStore();

      const hasApplication = computed(() => Boolean(companyStore.applicationInfo?.companyApplication));

      await companyStore.fetchCurrentApplication();

      return {
        hasApplication,
      };
    },
  });
</script>
