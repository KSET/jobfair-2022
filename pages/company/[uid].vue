<template>
  <div style="display: contents;">
    <NuxtPage v-if="hasCompany" />
    <page-not-found v-else />
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    useRoute,
  } from "#imports";
  import PageNotFound from "~/components/page-not-found.vue";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageCompanyContainer",

    components: {
      PageNotFound,
    },

    async setup() {
      const route = useRoute();
      const companyStore = useCompanyStore();

      const company = await companyStore.fetchCompanyInfo(route.params.uid as string);

      return {
        hasCompany: computed(() => Boolean(company)),
      };
    },
  });
</script>
