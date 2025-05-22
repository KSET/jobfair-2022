<template>
  <app-max-width-container>
    <h1>Statistika</h1>

    <ul>
      <li>
        <strong>Životopisa</strong>: <em v-text="resp.resumes.total" />
      </li>
      <li>
        <strong>Ulaza</strong>: <em v-text="resp.season.entryCount" />
      </li>
      <li>
        <strong>Firme skenirani QR</strong>: <em v-text="resp.season.companyScannedQRs" />
      </li>
    </ul>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    useQuery,
    useRoute,
  } from "#imports";

  export default defineComponent({
    name: "PageAdminSeasonStatistics",

    components: {
      AppMaxWidthContainer,
    },

    async setup() {
      const route = useRoute();

      type QData = {
        resumes: {
          total: number,
        },
      };
      type QArgs = {
        season: string,
      };
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query Info($season: String!) {
            resumes {
              total
            }
            season(uid: $season) {
              entryCount
              companyScannedCvs
              companyScannedQRs
            }
          }
        `,
        variables: {
          season: route.params.season as string,
        },
      })().then((resp) => resp!.data!);

      return {
        resp,
      };
    },
  });
</script>
