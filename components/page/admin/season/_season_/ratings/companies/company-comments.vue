<template>
  <div class="flex flex-column gap-4">
    <div v-for="entry in componentData?.companyComponentAverageRatings" :key="entry.component">
      <div>
        <strong>{{ entry.component }}</strong>: {{ entry.averageRating.toFixed(4) }}
      </div>

      <div class="flex flex-column gap-1">
        <Panel v-for="comment in entry.comments" :key="comment">
          {{ comment }}
        </Panel>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Panel from "primevue/panel";
  import {
    graphql,
  } from "~/graphql/client";

  const props = defineProps<{
    seasonUid: string,
    companyUid: string,
  }>();

  const componentData = await useQuery({
    query: graphql(/* GraphQL */ `
    query ComponentAdminSeasonRatingsCompaniesCompanyComments_Data($seasonUid: String!, $companyUid: String!) {
      companyComponentAverageRatings(seasonUid: $seasonUid, companyUid: $companyUid) {
        component
        averageRating
        comments
      }
    }
    `),
    variables: {
      seasonUid: props.seasonUid,
      companyUid: props.companyUid,
    },
  })().then((res) => res?.data);
</script>

<style lang="scss" module>
</style>
