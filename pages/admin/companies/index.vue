<template>
  <app-max-width-container>
    <h1>Firme ({{ companies.length }})</h1>

    <DataTable :value="companies" data-key="vat" row-hover>
      <Column field="industry.name" header="Industrija" sortable>
        <template #body="{ data }">
          <p-chip :label="data.industry.name" />
        </template>
      </Column>
      <Column field="brandName" header="Ime" sortable>
        <template #body="{ data }">
          <strong v-tooltip.top="data.legalName" v-text="data.brandName" />
        </template>
      </Column>
      <Column header="Članovi">
        <template #body="{ data }">
          <dl v-if="data.members.length > 0" class="m-0">
            <dt
              v-for="member in data.members"
              :key="member.uid"
            >
              <span v-text="member.name" />
              -
              <em v-text="member.email" />
              &nbsp;
              <nuxt-link :to="{ name: 'admin-users-uid-edit', params: { uid: member.uid } }">
                Edit
              </nuxt-link>
            </dt>
          </dl>
          <span v-else>
            /
          </span>
        </template>
      </Column>
      <Column body-style="text-align: center; overflow: visible" header-style="width: 4rem; text-align: center">
        <template #body="{ data }">
          <nuxt-link :to="{ name: 'admin-companies-vat-edit', params: { vat: data.vat } }">
            Edit
          </nuxt-link>
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import Chip from "primevue/chip";
  import Tooltip from "primevue/tooltip";
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
    IIndustry,
    IUser,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminCompaniesList",

    components: {
      AppMaxWidthContainer,
      PChip: Chip,
      DataTable,
      Column,
    },

    directives: {
      tooltip: Tooltip,
    },

    async setup() {
      useTitle("Admin | Companies", false);

      type QMember = Pick<IUser, "uid" | "name" | "email">;
      type QIndustry = Pick<IIndustry, "name">;
      type QCompany = Pick<ICompany, "vat" | "legalName" | "brandName"> & {
        industry: QIndustry,
        members: QMember[],
      };
      type QData = {
        companies: QCompany[],
      };
      type QArgs = never;
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query Data {
            companies(orderBy: { legalName: asc }) {
                vat
                legalName
                brandName
                industry {
                    name
                }
                members {
                    uid
                    name
                    email
                }
            }
          }
        `,
      })().then((resp) => resp?.data);

      return {
        companies: resp?.companies || [],
      };
    },
  });
</script>
