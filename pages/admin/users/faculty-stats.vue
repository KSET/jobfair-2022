<template>
  <app-max-width-container>
    <h1>Statistika po fakultetima</h1>

    <div>
      <nuxt-link :to="{ name: 'admin' }">
        <p-button>
          &larr; Natrag
        </p-button>
      </nuxt-link>
    </div>

    <h4>Ukupno korisnika: {{ totalUsers }}</h4>

    <DataTable
      :value="facultyStats"
      sort-field="count"
      :sort-order="-1"
      row-hover
    >
      <Column field="name" header="Fakultet" sortable />
      <Column field="count" header="Broj korisnika" sortable />
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useQuery,
  } from "~/composables/useQuery";

  export default defineComponent({
    name: "PageAdminUsersFacultyStats",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
    },

    async setup() {
      useTitle("Admin | Statistika po fakultetima", false);

      type QUser = {
        resume: {
          faculty: {
            name: string,
          } | null,
        } | null,
      };
      type QData = { users: QUser[], };

      const users = await useQuery<QData, never>({
        query: gql`
          query FacultyStats {
            users {
              resume {
                faculty {
                  name
                }
              }
            }
          }
        `,
      })().then((resp) => resp?.data?.users ?? []);

      const totalUsers = users.length;

      const countByFaculty = new Map<string, number>();
      for (const user of users) {
        const name = user.resume?.faculty?.name?.trim() || "";
        const key = name || "(nije upisano)";
        countByFaculty.set(key, (countByFaculty.get(key) ?? 0) + 1);
      }

      const facultyStats = Array.from(countByFaculty.entries()).map(([ name, count ]) => ({ name, count }));

      return {
        totalUsers,
        facultyStats,
      };
    },
  });
</script>
