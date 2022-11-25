<template>
  <div style="display: contents;">
    <NuxtPage
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
    name: "PageProfileCompanyFeedbackHandler",

    components: {
      PageNotFound,
    },

    async setup() {
      const companyStore = useCompanyStore();

      await companyStore.fetchCurrentApplication();

      return {
        hasApplication: computed(() => companyStore.hasApplication),
      };
    },
  });
</script>
