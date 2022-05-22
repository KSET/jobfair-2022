<template>
  <div style="display: contents;">
    <nuxt-nested-page
      v-if="isAllowed"
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
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    unref,
  } from "#imports";

  export default defineComponent({
    name: "PageProfileCompanyApplicationHandler",

    components: {
      PageNotFound,
    },

    async setup() {
      const companyStore = useCompanyStore();
      const seasonsStore = useSeasonsStore();

      const hasApplication = computed(() => Boolean(companyStore.applicationInfo?.companyApplication));
      const applicationsEditable = computed(() => seasonsStore.areApplicationsEditable);

      await companyStore.fetchCurrentApplication();

      return {
        isAllowed: computed(() => unref(hasApplication) && unref(applicationsEditable)),
      };
    },
  });
</script>
