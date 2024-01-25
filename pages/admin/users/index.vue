<template>
  <app-max-width-container>
    <h1>Korisnici ({{ users.length }})</h1>

    <div>
      <nuxt-link :to="{ name: 'admin' }">
        <p-button>
          &larr; Natrag
        </p-button>
      </nuxt-link>
    </div>

    <h4>Statistika:</h4>
    <ul>
      <li>Studenti: {{ stats.students }}</li>
      <li>Ne-studenti: {{ stats.nonStudents }}</li>
      <li>Admini: {{ stats.admins }}</li>
    </ul>

    <LazyClientOnly>
      <DataTable
        ref="dt"
        v-model:filters="filters"
        :value="users"
        data-key="uid"
        filter-display="menu"
        row-hover
        sort-mode="multiple"
        :global-filter-fields="['name', 'email']"
        paginator
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        :rows="20"
        :rows-per-page-options="[2,5,10,20,50,100]"
        responsive-layout="scroll"
      >
        <template #header>
          <div :class="$style.tableHeader">
            <p-button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />

            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Pretraži ime i email" />
            </span>
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
    </LazyClientOnly>
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
  import InputText from "primevue/inputtext";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    ref,
    unref,
    useQuery,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    type ICompany,
    type IResume,
    type IRole,
    type IUser,
  } from "~/graphql/schema";
  import AppTime from "~/components/util/app-time.vue";

  export default defineComponent({
    name: "PageAdminUsersList",

    components: {
      AppTime,
      AppMaxWidthContainer,
      DataTable,
      Column,
      InputText,
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
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
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

<style lang="scss" module>
  .tableHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
