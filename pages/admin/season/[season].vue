<template>
  <div style="display: contents;">
    <nuxt-nested-page
      v-if="season"
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
  import {
    gql,
  } from "@urql/core";
  import {
    useRoute,
  } from "vue-router";
  import PageNotFound from "~/components/page-not-found.vue";
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

    components: {
      PageNotFound,
    },

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
      seasonsStore.setSeason(season);

      return {
        season: computed(() => seasonsStore.season),
      };
    },
  });
</script>
