<template>
  <app-max-width-container>
    <h1>Korisnici ({{ users.length }})</h1>

    <h4>Statustika:</h4>
    <ul>
      <li>Studenti: {{ stats.students }}</li>
      <li>Ne-studenti: {{ stats.nonStudents }}</li>
      <li>Admini: {{ stats.admins }}</li>
    </ul>

    <client-only>
      <DataTable
        ref="dt"
        v-model:filters="filters"
        :value="users"
        data-key="uid"
        filter-display="menu"
        row-hover
        sort-mode="multiple"
      >
        <template #header>
          <div style="text-align: left;">
            <p-button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
          </div>
        </template>
        <Column field="name" header="Ime" sortable style="min-width: 3em;" />
        <Column field="email" header="Email" sortable style="min-width: 3em;" />
        <Column data-type="date" field="createdAt" header="Registriran" sortable>
          <template #body="{ data }">
            <app-time :time="data.createdAt" />
          </template>
        </Column>
        <Column field="isStudent" header="Student?" sortable>
          <template #filter="{ filterModel }">
            <label>
              <input v-model="filterModel.value" class="p-column-filter" type="checkbox"> Student
            </label>
          </template>
          <template #body="{ data }">
            <span v-if="data.isStudent">Da</span>
            <span v-else>Ne</span>
          </template>
        </Column>
        <Column field="hasResume" header="Životopis?" sortable>
          <template #filter="{ filterModel }">
            <label>
              <input v-model="filterModel.value" class="p-column-filter" type="checkbox"> Životopis
            </label>
          </template>
          <template #body="{ data }">
            <span v-if="data.hasResume">Da</span>
            <span v-else>Ne</span>
          </template>
        </Column>
        <Column body-style="text-align: center; overflow: visible" header-style="width: 4rem; text-align: center">
          <template #body="{ data }">
            <nuxt-link :to="{ name: 'admin-users-uid-edit', params: { uid: data.uid } }">
              Edit
            </nuxt-link>
          </template>
        </Column>
      </DataTable>
    </client-only>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    map,
    sortBy,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import {
    FilterMatchMode,
  } from "primevue/api";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    ref,
    unref,
    useQuery,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    ICompany,
    IResume,
    IRole,
    IUser,
  } from "~/graphql/schema";
  import AppTime from "~/components/util/app-time.vue";

  export default defineComponent({
    name: "PageAdminUsersList",

    components: {
      AppTime,
      AppMaxWidthContainer,
      DataTable,
      Column,
    },

    async setup() {
      useTitle("Admin | Users", false);

      type QUser = Pick<IUser, "uid" | "name" | "email" | "createdAt"> & {
        companies: Pick<ICompany, "uid">[],
        roles: Pick<IRole, "name">[],
        resume: Pick<IResume, "uid"> | null,
      };
      type QData = {
        users: QUser[],
      };
      type QArgs = never;
      const users = await useQuery<QData, QArgs>({
        query: gql`
          query Data {
            users {
              uid
              name
              email
              roles {
                name
              }
              companies {
                uid
              }
              resume {
                uid
              }
              createdAt
            }
          }
        `,
      })()
        .then((resp) => resp?.data?.users || [])
        .then(sortBy<QUser>((u) => new Date(u.createdAt as string)))
        .then(map<QUser, QUser & { isStudent: boolean, }>((x) => Object.assign(x, {
          isStudent: 0 === (x.companies?.length ?? 0),
          hasResume: Boolean(x.resume),
        })))
      ;

      const adminCount = users.reduce((acc, u) => acc + Number(u.roles.some((r) => "admin" === r.name)), 0);
      const studentCount = users.reduce((acc, u) => acc + Number(u.isStudent), 0) - adminCount;

      const stats = {
        admins: adminCount,
        students: studentCount,
        nonStudents: users.length - studentCount - adminCount,
      };

      const filters = ref({
        isStudent: { value: null, matchMode: FilterMatchMode.EQUALS },
        hasResume: { value: null, matchMode: FilterMatchMode.EQUALS },
      });

      const dt = ref<DataTable | null>(null);

      return {
        dt,
        users,
        stats,
        filters,
        exportCSV() {
          const $dt = unref(dt);

          if (!$dt) {
            return;
          }

          $dt.exportCSV();
        },
      };
    },
  });
</script>
