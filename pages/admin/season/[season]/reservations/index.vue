<template>
  <app-max-width-container>
    <h1>Rezervacije</h1>

    <DataTable
      ref="dt"
      :rows="20"
      :rows-per-page-options="[2,5,10,20,50,100]"
      :value="reservations"
      data-key="uid"
      paginator
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      responsive-layout="scroll"
      row-hover
      sort-mode="multiple"
    >
      <template #header>
        <div :class="$style.tableHeader">
          <p-button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />
        </div>
      </template>
      <Column field="companyName" header="Firma" sortable>
        <template #body="{ data }">
          <nuxt-link :to="{ name: 'admin-companies-vat-edit', params: { vat: data.company.vat } }">
            <strong v-text="data.company.brandName" />
          </nuxt-link>
        </template>
      </Column>
      <Column field="type" header="Event" sortable />
      <Column field="title" header="Naslov" sortable>
        <template #body="{ data }">
          <nuxt-link :to="{ name: 'company-uid', params: { uid: data.company.uid }, query: { tab: data.type } }">
            <strong v-text="data.title" />
          </nuxt-link>
        </template>
      </Column>
      <Column field="count" header="Broj prijava" sortable />
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    fromPairs,
    groupBy,
    map,
    toPairs,
  } from "rambdax";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    ref,
    unref,
    useQuery,
    useTitle,
  } from "#imports";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    AdminReservationsData,
    type IAdminReservationsDataQuery,
    type IAdminReservationsDataQueryVariables,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminSeasonUserReservations",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
    },

    async setup() {
      useTitle("Admin | Rezervacije");

      const seasonsStore = useSeasonsStore();
      const resp = await useQuery<IAdminReservationsDataQuery, IAdminReservationsDataQueryVariables>({
        query: AdminReservationsData,
        variables: {
          seasonUid: seasonsStore.season!.uid!,
        },
      })().then((resp) => resp?.data);

      const participants =
        (resp?.participants ?? [])
          .flatMap(
            ({ program, ...participant }) =>
              toPairs(program!)
                .map(([ type, rest ]) => ({ type, ...rest!, company: participant }))
            ,
          )
      ;
      const participantsGrouped = map(
        (items: (typeof participants)) =>
          fromPairs(items.map((item) => [ item.uid, item ]))
        ,
        groupBy(
          (participant) =>
            participant.type
          ,
          participants,
        ),
      );
      const reservations =
        (resp?.season?.reservations ?? [])
          .map((reservation) => {
            const event = participantsGrouped[reservation.type][reservation.uid];

            return {
              ...reservation,
              title: "titleHr" in event ? event.titleHr : event.name,
              company: event.company,
            };
          })
          .sort((lt, gt) => lt.company.brandName.localeCompare(gt.company.brandName))
      ;

      const dt = ref<DataTable | null>(null);

      return {
        reservations,
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
