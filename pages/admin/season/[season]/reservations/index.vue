<template>
  <app-max-width-container>
    <h1>Rezervacije</h1>

    <DataTable
      :value="reservations"
      data-key="uid"
      row-hover
      sort-mode="multiple"
    >
      <Column field="event.company.brandName" header="Firma" sortable />
      <Column field="type" header="Event" sortable />
      <Column field="event.titleHr" header="Naslov" sortable />
      <Column field="count" header="Broj prijava" sortable />
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
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
    useQuery,
  } from "#imports";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    IApplicationWorkshop,
    ICompany,
    IReservationItem,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminSeasonUserReservations",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();

      type QSeason = {
        reservations: Pick<IReservationItem, "uid" | "type" | "count">[],
      };
      type QWorkshop = Pick<IApplicationWorkshop, "uid" | "titleHr">;
      type QParticipant = Pick<ICompany, "brandName"> & {
        program: {
          workshop: QWorkshop,
        },
      };
      type QData = {
        season: QSeason,
        participants: QParticipant[],
      };
      const resp = await useQuery<QData, { season: string, }>({
        query: gql`
          query Data($season: String!) {
            season(uid: $season) {
              reservations {
                uid
                type
                count
              }
            }

            participants {
              brandName
              program {
                workshop {
                  uid
                  titleHr
                }
              }
            }
          }
        `,
        variables: {
          season: seasonsStore.season!.uid!,
        },
      })().then((resp) => resp?.data);

      const participants =
        (resp?.participants || [])
          .flatMap(
            ({ program, ...participant }) =>
              toPairs(program)
                .map(([ type, rest ]) => ({ type, ...rest, company: participant }))
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
        (resp?.season?.reservations || [])
          .map((reservation) => Object.assign(reservation, {
            event: participantsGrouped[reservation.type][reservation.uid],
          }))
          .sort((a, b) => a.event.company.brandName.localeCompare(b.event.company.brandName))
      ;

      return {
        reservations,
      };
    },
  });
</script>
