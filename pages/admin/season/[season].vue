<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    useRoute,
  } from "vue-router";
  import {
    createError,
    defineComponent,
  } from "#imports";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    graphql,
  } from "~/graphql/client";

  export default defineComponent({
    name: "AdminRouteHandler",

    async setup() {
      const route = useRoute();
      const seasonsStore = useSeasonsStore();

      const seasonUid = route.params.season as string;
      const res = await useQuery({
        query: graphql(`
        query PageAdminSeasonSeasonData($uid: String!) {
            season(uid: $uid) {
                uid
                name
                startsAt
                endsAt
                applicationsFrom
                applicationsUntil
            }
        }
        `),
        variables: {
          uid: seasonUid,
        },
      })();

      const season = res?.data?.season;

      if (!season) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }

      seasonsStore.setSeason(season);
    },
  });
</script>
