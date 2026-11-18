<template>
  <div />
</template>

<script lang="ts">
  import {
    useRoute,
  } from "vue-router";
  import {
    defineComponent,
    navigateTo,
  } from "#imports";

  export default defineComponent({
    name: "PageAccountManagerCompanyApplication",

    async setup() {
      const route = useRoute();

      await navigateTo(
        {
          name: "account-manager",
          query: {
            company: route.params.vat as string,
          },
        },
        {
          replace: true,
        },
      );
    },
  });
</script>
