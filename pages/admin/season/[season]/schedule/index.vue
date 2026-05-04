<template>
  <app-max-width-container :class="$style.container">
    <h1>Raspored za {{ season.name }}</h1>

    <fieldset
      v-for="(panel, index) in panels"
      :key="panel.value ? panel.value.uid : 'new-' + index"
    >
      <legend>
        <strong>
          <em>
            [Panel{{ panel.value ? `: ${panel.value.name}` : ' (new)' }}]
          </em>
        </strong>
      </legend>

      <EditPanel
        v-model:item="panel.value"
        :panelists="panelists"
        :season="season.uid"
        @delete="refreshPanels"
        @submit="refreshPanels"
      />
    </fieldset>

    <fieldset
      v-for="otherContent in otherContents"
      :key="otherContent.uid"
      :class="{
        [$style.missingItem]: !otherContent.event,
      }"
    >
      <legend>
        <strong>
          <em>[{{ otherContent.nameHr }}]</em>
        </strong>
      </legend>

      <EditScheduleItemFor
        v-model:item="otherContent.event"
        :for-uid="otherContent.uid"
        :season="season.uid"
        :type="otherContent.subtype"
        @delete="refreshOtherContents"
        @submit="refreshOtherContents"
      />
    </fieldset>

    <fieldset>
      <legend>
        <strong>
          <em>[Schedule Only]</em>
        </strong>
      </legend>

      <fieldset
        v-for="item in otherCalendarItems"
        :key="item.value ? item.value.uid : 'new'"
      >
        <EditScheduleItemFor
          v-model:item="item.value"
          :loading="isCalendarLoading"
          :season="season.uid"
          @delete="refreshCalendarItems"
          @submit="refreshCalendarItems"
        />
      </fieldset>
    </fieldset>

    <fieldset
      v-for="participant in participants"
      :key="participant.uid"
    >
      <legend>
        <strong v-text="participant.brandName" />
      </legend>

      <fieldset
        v-if="participant.program?.talk"
        :class="{
          [$style.missingItem] : !participant.program?.talk.event,
        }"
      >
        <legend>
          Talk
        </legend>

        <EditScheduleItemFor
          v-model:item="participant.program.talk.event"
          :for-uid="participant.program?.talk.uid"
          :season="season.uid"
          type="talk"
        />
      </fieldset>

      <fieldset
        v-if="participant.program?.workshop"
        :class="{
          [$style.missingItem] : !participant.program.workshop.event,
        }"
      >
        <legend>
          Workshop
        </legend>

        <EditScheduleItemFor
          v-model:item="participant.program.workshop.event"
          :for-uid="participant.program.workshop.uid"
          :season="season.uid"
          type="workshop"
        />
      </fieldset>

      <fieldset
        v-if="participant.program?.fusion"
        :class="{
          [$style.missingItem] : !participant.program.fusion.event,
        }"
      >
        <legend>
          Fusion
        </legend>

        <EditScheduleItemFor
          v-model:item="participant.program.fusion.event"
          :for-uid="participant.program.fusion.uid"
          :season="season.uid"
          type="fusion"
        />
      </fieldset>
    </fieldset>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    computed,
    defineComponent,
    reactive,
    unref,
    useQuery,
    useRoute,
    ref,
  } from "#imports";
  import {
    type IPageAdminSeasonScheduleBaseQuery,
    type IPageAdminSeasonScheduleBaseQueryVariables,
    type ISeason,
    PageAdminSeasonScheduleBase,
  } from "~/graphql/schema";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import EditScheduleItemFor from "~/components/page/admin/season/_season_/schedule/edit-schedule-item-for.vue";
  import EditPanel from "~/components/page/admin/season/_season_/schedule/edit-panel.vue";

  export default defineComponent({
    name: "PageAdminScheduleEdit",

    components: {
      EditPanel,
      EditScheduleItemFor,
      AppMaxWidthContainer,
    },

    async setup() {
      const route = useRoute();
      const seasonsStore = useSeasonsStore();
      const seasonUid = route.params.season as string;

      type QData = IPageAdminSeasonScheduleBaseQuery;
      type QEvent = NonNullable<QData["season"]>["calendar"][number];
      const queryData = useQuery<IPageAdminSeasonScheduleBaseQuery, IPageAdminSeasonScheduleBaseQueryVariables>({
        query: PageAdminSeasonScheduleBase,
        variables: {
          seasonUid,
        },
      });

      type QPanel = NonNullable<QData["season"]>["panels"][number];
      const queryCalendar = useQuery<{ season: { calendar: QEvent[], }, }, { season: string, }>({
        query: gql`
          query Calendar($season: String!) {
            season(uid: $season) {
              calendar {
                uid
                type
                title
                start
                end
                location
                text
                grouped
              }
            }
          }
        `,
        variables: {
          season: seasonUid,
        },
      });

      type QOtherContent = { uid: string, nameHr: string, subtype: string, event: QEvent | null, };
      const queryOtherContents = useQuery<{ otherContents: QOtherContent[], }, { season: string, }>({
        query: gql`
          query OtherContents($season: String) {
            otherContents(season: $season) {
              uid
              nameHr
              subtype
              event {
                uid
                type
                title
                start
                end
                location
                text
                grouped
              }
            }
          }
        `,
        variables: {
          season: seasonUid,
        },
      });

      const queryPanels = useQuery<{ season: { panels: QPanel[], }, }, { season: string, }>({
        query: gql`
          query Panels($season: String!) {
            season(uid: $season) {
              panels {
                uid
                name
                description
                companies {
                  uid
                }
                event {
                  uid
                  type
                  title
                  start
                  end
                  location
                  text
                  grouped
                }
              }
            }
          }
        `,
        variables: {
          season: seasonUid,
        },
      });

      const resp = reactive(await queryData().then((resp) => resp?.data) ?? {} as QData);
      const otherContents = ref<QOtherContent[]>(await queryOtherContents().then((r) => r?.data?.otherContents ?? []));

      const participants = computed(() => resp.participants || []);

      const preparedCalendarIds = computed(() => new Set(
        [
          ...unref(participants).flatMap((p) => [
            p.program?.talk?.event?.uid,
            p.program?.workshop?.event?.uid,
            p.program?.fusion?.event?.uid,
          ]),
          ...(resp.season?.panels || []).map((p) => p?.event?.uid),
          ...unref(otherContents).map((oc) => oc.event?.uid),
        ].filter((x) => x),
      ));

      const otherCalendarItems = computed(() => [
        ...resp.season!.calendar.filter((x) => !unref(preparedCalendarIds).has(x.uid)).map((value) => ({ value })),
        { value: null },
      ]);

      type Panelist = NonNullable<QData["participants"][number]>;

      const isCalendarLoading = ref(false);

      return {
        otherCalendarItems,
        otherContents,
        participants,
        isCalendarLoading,
        season: computed(() => seasonsStore.season as ISeason),
        panels: computed(() => [
          ...(resp.season?.panels || []).map((value) => ({ value })),
          { value: null },
        ]),
        calendar: resp.season!.calendar,
        panelists: computed(() => unref(participants).filter((p) => 0 < (p?.program?.panelParticipants?.length ?? 0)).map((p): Panelist => ({
          firstName: p.program!.panelParticipants[0].firstName,
          lastName: p.program!.panelParticipants[0].lastName,
          company: {
            uid: p.uid,
            brandName: p.brandName,
          },
        }))),
        async refreshOtherContents() {
          otherContents.value = await queryOtherContents().then((r) => r?.data?.otherContents ?? []);
        },
        async refreshPanels() {
          const panels = await queryPanels().then((resp) => resp?.data?.season?.panels || []);
          resp.season!.panels = panels;
        },
        async refreshCalendarItems() {
          isCalendarLoading.value = true;
          const calendar = await queryCalendar().then((resp) => resp?.data?.season?.calendar || []);
          isCalendarLoading.value = false;

          resp.season!.calendar = calendar;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    fieldset + fieldset {
      margin-top: 1rem;
    }

    fieldset {
      border-radius: 4px;
    }

    .missingItem {
      border-color: $fer-error;
    }
  }
</style>
