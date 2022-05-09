<template>
  <app-max-width-container>
    <h1>Korisnici ({{ users.length }})</h1>

    <h4>Statustika:</h4>
    <ul>
      <li>Studenti: {{ stats.students }}</li>
      <li>Ne-studenti: {{ stats.nonStudents }}</li>
      <li>Admini: {{ stats.admins }}</li>
    </ul>

    <DataTable :value="users" data-key="uid" row-hover sort-mode="multiple">
      <Column field="name" header="Ime" sortable style="min-width: 3em;" />
      <Column field="email" header="Email" sortable style="min-width: 3em;" />
      <Column data-type="date" field="createdAt" header="Registriran" sortable>
        <template #body="{ data }">
          <app-time :time="data.createdAt" />
        </template>
      </Column>
      <Column field="isStudent" header="Student?" sortable>
        <template #body="{ data }">
          <span v-if="data.isStudent">Da</span>
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
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    useQuery,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    ICompany,
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
              createdAt
            }
          }
        `,
      })()
        .then((resp) => resp?.data?.users || [])
        .then(sortBy<QUser>((u) => new Date(u.createdAt as string)))
        .then(map<QUser, QUser & { isStudent: boolean, }>((x) => Object.assign(x, {
          isStudent: 0 < (x.companies?.length ?? 0),
        })))
      ;

      const adminCount = users.reduce((acc, u) => acc + Number(u.roles.some((r) => "admin" === r.name)), 0);
      const studentCount = users.reduce((acc, u) => acc + Number(u.isStudent), 0) - adminCount;

      const stats = {
        admins: adminCount,
        students: studentCount,
        nonStudents: users.length - studentCount - adminCount,
      };

      return {
        users,
        stats,
      };
    },
  });
</script>
