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
          <template v-if="data.company">
            <nuxt-link :to="{ name: 'admin-companies-vat-edit', params: { vat: data.company.vat } }">
              <strong v-text="data.company.brandName" />
            </nuxt-link>
          </template>
          <span v-else>—</span>
        </template>
      </Column>
      <Column field="type" header="Event" sortable />
      <Column field="title" header="Naslov" sortable>
        <template #body="{ data }">
          <nuxt-link v-if="data.company" :to="{ name: 'company-uid', params: { uid: data.company.uid }, query: { tab: data.type } }">
            <strong v-text="data.title" />
          </nuxt-link>
          <nuxt-link v-else-if="data.eventUid" :to="{ name: 'calendar-event-uid', params: { uid: data.eventUid } }">
            <strong v-text="data.title" />
          </nuxt-link>
          <strong v-else v-text="data.title" />
        </template>
      </Column>
      <Column field="count" header="Broj prijava" sortable />
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
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

      type ProgramEntry = { uid: string, } & ({ titleHr: string, } | { name: string, });
      type Company = { uid: string, vat: string, brandName: string, };
      type ParticipantEntry = ProgramEntry & { type: string, company: Company, };

      const participants: ParticipantEntry[] =
        (resp?.participants ?? [])
          .flatMap(({ program, ...participant }) => {
            if (!program) {
              return [];
            }
            const entries = Object.entries(program) as [ string, ProgramEntry | null | undefined ][];
            return entries
              .filter((entry): entry is [ string, ProgramEntry ] => null !== entry[1])
              .map(([ type, rest ]) => ({ type, ...rest, company: participant as Company }));
          })
      ;

      const participantsGrouped: Record<string, Record<string, ParticipantEntry>> = {};
      for (const participant of participants) {
        if (!participantsGrouped[participant.type]) {
          participantsGrouped[participant.type] = {};
        }
        participantsGrouped[participant.type][participant.uid] = participant;
      }

      const reservations =
        (resp?.season?.reservations ?? [])
          .map((reservation) => {
            const event = participantsGrouped[reservation.type]?.[reservation.uid];

            if (!event) {
              return null;
            }

            return {
              ...reservation,
              title: "titleHr" in event ? event.titleHr : event.name,
              company: event.company,
            };
          })
          .filter((x): x is NonNullable<typeof x> => null !== x)
          .sort((lt, gt) => lt.company.brandName.localeCompare(gt.company.brandName))
      ;

      const otherContentById = Object.fromEntries((resp?.otherContents ?? []).map((oc) => [ oc.uid, oc ]));
      const otherContentRows = (resp?.season?.reservations ?? [])
        .filter((r) => [ "hot-talk", "loosen-up", "debate", "other" ].includes(r.type))
        .map((r) => {
          const oc = otherContentById[r.uid];
          if (!oc) { return null; }
          return { ...r, title: oc.nameHr, company: null, eventUid: oc.event?.uid ?? null };
        })
        .filter(Boolean)
      ;

      const allReservations = [ ...reservations, ...otherContentRows ];

      const dt = ref<DataTable | null>(null);

      return {
        reservations: allReservations,
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
