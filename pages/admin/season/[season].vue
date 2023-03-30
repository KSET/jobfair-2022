<template>
  <NuxtPage />
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
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
    ISeason,
  } from "~/graphql/schema";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  export default defineComponent({
    name: "AdminRouteHandler",

    async setup() {
      const route = useRoute();
      const seasonsStore = useSeasonsStore();

      const seasonUid = route.params.season as string;
      type QData = {
        season: Pick<ISeason,
                     "name"
                       | "startsAt"
                       | "endsAt"
                       | "applicationsFrom"
                       | "applicationsUntil">,
      };
      type QArgs = {
        uid: string,
      };
      const res = await useQuery<QData, QArgs>({
        query: gql`
        query Query($uid: String!) {
            season(uid: $uid) {
                uid
                name
                startsAt
                endsAt
                applicationsFrom
                applicationsUntil
            }
        }
        `,
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
