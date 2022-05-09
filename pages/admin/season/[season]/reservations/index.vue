<template>
  <app-max-width-container>
    <h1>Rezervacije</h1>
    <ul>
      <li v-for="reservation in reservations" :key="reservation.uid">
        [{{ reservation.event.company.brandName }}] <strong v-text="reservation.event.titleHr" />: <em v-text="reservation.count" />
      </li>
    </ul>
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
