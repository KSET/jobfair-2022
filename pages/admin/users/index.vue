<template>
  <app-max-width-container>
    <h1>Korisnici ({{ users.length }})</h1>

    <DataTable :value="users" data-key="uid" row-hover>
      <Column field="name" header="Ime" sortable style="min-width: 3em;" />
      <Column field="email" header="Email" sortable style="min-width: 3em;" />
      <Column field="createdAt" header="Registriran" sortable data-type="date">
        <template #body="{ data }">
          <app-time :time="data.createdAt" />
        </template>
      </Column>
      <Column header-style="width: 4rem; text-align: center" body-style="text-align: center; overflow: visible">
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

      type QUser = Pick<IUser, "uid" | "name" | "email" | "createdAt">;
      type QData = {
        users: QUser[],
      };
      type QArgs = never;
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query Data {
            users {
              uid
              name
              email
              roles {
                name
              }
              createdAt
            }
          }
        `,
      })().then((resp) => resp?.data);

      return {
        users: sortBy((u) => new Date(u.createdAt as string), resp?.users || []),
      };
    },
  });
</script>
