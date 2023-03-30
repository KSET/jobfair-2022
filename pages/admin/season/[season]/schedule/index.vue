<template>
  <app-max-width-container :class="$style.container">
    <h1>Raspored za {{ season.name }}</h1>

    <fieldset>
      <legend>
        <strong>
          <em>
            [Panel]
          </em>
        </strong>
      </legend>

      <EditPanel
        v-model:item="panel"
        :panelists="panelists"
        :season="season.uid"
      />
    </fieldset>

    <fieldset>
      <legend>
        <strong>
          <em>[Other]</em>
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
    toRef,
    unref,
    useQuery,
    useRoute,
    ref,
  } from "#imports";
  import {
    IApplicationPresenter,
    IApplicationTalk,
    IApplicationWorkshop,
    ICalendarItem,
    ICompany,
    ICompanyPanel,
    IImage,
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
      const season = route.params.season as string;

      type QEvent = ICalendarItem;
      type QParticipant = Pick<ICompany, "uid" | "brandName"> & {
        program: {
          talk: Pick<IApplicationTalk, "titleHr" | "event"> & { event: QEvent, } | null,
          workshop: Pick<IApplicationWorkshop, "titleHr" | "event"> & { event: QEvent, } | null,
          panelParticipants: (Pick<IApplicationPresenter, "firstName" | "lastName"> & {
            photo: Pick<IImage, "fullUrl" | "thumbUrl">,
          })[],
        },
      };
      type QSeason = {
        panel: Pick<ICompanyPanel, "uid" | "name"> & {
          companies: Pick<ICompany, "brandName">,
          event: QEvent,
        },
        calendar: QEvent[],
      };
      type QData = {
        participants: QParticipant[],
        season: QSeason,
      };
      type QArgs = {
        season: string,
      };
      const queryData = useQuery<QData, QArgs>({
        query: gql`
          query Data($season: String!) {
            participants(season: $season) {
              uid
              brandName
              program {
                talk {
                  uid
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
                workshop {
                  uid
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
                panelParticipants {
                  firstName
                  lastName
                  photo {
                    fullUrl
                    thumbUrl
                  }
                }
              }
            }
            season(uid: $season) {
              panel {
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
          season,
        },
      });

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
          season,
        },
      });

      const resp = reactive(await queryData().then((resp) => resp?.data) ?? {} as QData);

      const participants = computed(() => resp.participants || []);

      const preparedCalendarIds = computed(() => new Set(
        [
          ...unref(participants).flatMap((p) => [
            p.program?.talk?.event?.uid,
            p.program?.workshop?.event?.uid,
          ]),
          resp.season?.panel?.event?.uid,
        ].filter((x) => x),
      ));

      const otherCalendarItems = computed(() => [
        ...resp.season.calendar.filter((x) => !unref(preparedCalendarIds).has(x.uid)).map((value) => ({ value })),
        { value: null },
      ]);

      type Panelist = Pick<IApplicationPresenter, "firstName" | "lastName"> & {
        company: Pick<ICompany, "uid" | "brandName">,
      };

      const isCalendarLoading = ref(false);

      return {
        otherCalendarItems,
        participants,
        isCalendarLoading,
        season: computed(() => seasonsStore.season!),
        panel: toRef(resp.season, "panel"),
        calendar: resp.season.calendar,
        panelists: computed(() => unref(participants).filter((p) => 0 < (p?.program?.panelParticipants?.length ?? 0)).map((p): Panelist => ({
          firstName: p.program.panelParticipants[0].firstName,
          lastName: p.program.panelParticipants[0].lastName,
          company: {
            uid: p.uid,
            brandName: p.brandName,
          },
        }))),
        async refreshCalendarItems() {
          isCalendarLoading.value = true;
          const calendar = await queryCalendar().then((resp) => resp?.data?.season?.calendar || []);
          isCalendarLoading.value = false;

          resp.season.calendar = calendar;
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
