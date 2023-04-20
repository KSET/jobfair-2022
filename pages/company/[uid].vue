<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    createError,
    defineComponent,
    definePageMeta,
  } from "#imports";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    name: "PageCompanyContainer",

    setup() {
      definePageMeta({
        middleware: [
          async (route) => {
            const companyStore = useCompanyStore();

            const company = await companyStore.fetchCompanyInfo(route.params.uid as string);

            if (!company) {
              throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
            }
          },
        ],
      });
    },
  });
</script>
