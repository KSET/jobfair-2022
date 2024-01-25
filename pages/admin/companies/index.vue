<template>
  <app-max-width-container>
    <h1>Firme ({{ companies.length }})</h1>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      :value="companies"
      data-key="vat"
      row-hover
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
            <InputText v-model="filters['global'].value" placeholder="Pretraži firme" />
          </span>
        </div>
      </template>
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
      <Column field="members" header="Članovi">
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
  import {
    FilterMatchMode,
    FilterService,
  } from "primevue/api";
  import InputText from "primevue/inputtext";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    useQuery,

    ref,
    unref,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    type ICompany,
    type IIndustry,
    type IUser,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminCompaniesList",

    components: {
      AppMaxWidthContainer,
      PChip: Chip,
      DataTable,
      Column,
      InputText,
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

      const filters = ref({
        global: { value: null as string | null, matchMode: "$global" },
        "industry.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
        brandName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        members: { value: null, matchMode: "$members" },
      });

      const dt = ref<DataTable | null>(null);

      FilterService.register("$global", (value: unknown, filter: string | null | undefined) => {
        if (filter === undefined || null === filter || "" === filter.trim()) {
          return true;
        }

        const lowerFilter = filter.toLocaleLowerCase().trim();

        if ("string" === typeof value) {
          return value.toLowerCase().includes(lowerFilter);
        }

        if (Array.isArray(value) && 0 < value.length) {
          const isStringArray = "string" === typeof value[0];
          if (isStringArray) {
            return (value as string[]).some((v) => v.toLowerCase().includes(lowerFilter));
          }

          const membersArray = value as QMember[];
          const isMembersArray =
            "object" === typeof membersArray[0]
            && null !== membersArray[0]
            && "name" in membersArray[0]
            && "email" in membersArray[0]
          ;
          if (isMembersArray) {
            return (value as QMember[]).some(
              (member) =>
                member.name.toLowerCase().includes(lowerFilter)
                || member.email.toLowerCase().includes(lowerFilter)
              ,
            );
          }
        }

        return false;
      });

      FilterService.register("$members", (members: QMember[], membersFilter: string | null) => {
        const filter = (membersFilter)?.toLocaleLowerCase();

        if (filter === undefined || null === filter || "" === filter.trim()) {
          return true;
        }

        return members.some(
          (member) =>
            member.name.toLowerCase().includes(filter)
            || member.email.toLowerCase().includes(filter)
          ,
        );
      });

      return {
        companies: resp?.companies || [],
        filters,
        dt,
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
