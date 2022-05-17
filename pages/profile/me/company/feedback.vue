<template>
  <nuxt-nested-page
    v-if="isFeedbackOpen && hasApplication"
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
  import PageNotFound from "~/components/page-not-found.vue";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageProfileCompanyFeedbackHandler",

    components: {
      PageNotFound,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const companyStore = useCompanyStore();

      await companyStore.fetchCurrentApplication();

      return {
        isFeedbackOpen: computed(() => seasonsStore.isFeedbackOpen),
        hasApplication: computed(() => companyStore.hasApplication),
      };
    },
  });
</script>
