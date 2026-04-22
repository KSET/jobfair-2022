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

    <h3>Statistika po fakultetima (ulazi)</h3>
    <p>Ukupno ulaza: {{ totalEntries }}</p>
    <DataTable
      :value="facultyStats"
      sort-field="count"
      :sort-order="-1"
      row-hover
    >
      <Column field="name" header="Fakultet" sortable />
      <Column field="count" header="Broj ulaza" sortable />
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
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
      DataTable,
      Column,
    },

    async setup() {
      const route = useRoute();

      type QData = {
        resumes: { total: number, },
        season: { entryCount: number, companyScannedCvs: number, companyScannedQRs: number, },
        gateGuardianScanList: {
          eventType: string,
          forUser: {
            resume: {
              faculty: { name: string, } | null,
            } | null,
          } | null,
        }[],
      };
      type QArgs = { season: string, };

      const [ resp, scanList ] = await Promise.all([
        useQuery<QData, QArgs>({
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
          variables: { season: route.params.season as string },
        })().then((r) => r!.data!),

        useQuery<QData, QArgs>({
          query: gql`
            query FacultyEntries($season: String!) {
              gateGuardianScanList(season: $season) {
                eventType
                forUser {
                  resume {
                    faculty {
                      name
                    }
                  }
                }
              }
            }
          `,
          variables: { season: route.params.season as string },
        })().then((r) => r?.data?.gateGuardianScanList ?? []),
      ]);

      const entries = scanList.filter((log) => "ulaz" === log.eventType);
      const totalEntries = entries.length;

      const countByFaculty = new Map<string, number>();
      for (const log of entries) {
        const name = log.forUser?.resume?.faculty?.name?.trim() || "";
        const key = name || "(nije upisano)";
        countByFaculty.set(key, (countByFaculty.get(key) ?? 0) + 1);
      }

      const facultyStats = Array.from(countByFaculty.entries()).map(([ name, count ]) => ({ name, count }));

      return {
        resp,
        totalEntries,
        facultyStats,
      };
    },
  });
</script>
