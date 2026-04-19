<template>
  <panel-event-view v-if="'panel' === eventType && panelData" :panel="panelData" />
  <!-- TODO: <hot-talk-event-view v-else-if="'hot-talk' === eventType && hotTalkData" :hot-talk="hotTalkData" /> -->
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    definePageMeta,
    navigateTo,
    useQuery,
    useRoute,
    useState,
  } from "#imports";
  import {
    type IPageCalendarEventDataQuery,
    type IPageCalendarEventPanelDataQuery,
  } from "~/graphql/schema";
  import {
    graphql,
  } from "~/graphql/client";
  import PanelEventView from "~/components/page/calendar/panel-event-view.vue";

  export default defineComponent({
    name: "PageCalendarEventDispatcher",

    components: {
      PanelEventView,
    },

    setup() {
      definePageMeta({
        title: "Event",
        middleware: [
          async (route) => {
            const uid = route.params.uid as string;
            const routeState = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", uid ]));
            const panelState = useState<IPageCalendarEventPanelDataQuery | null>(JSON.stringify([ "calendar-item-panel", uid ]));

            const [
              routeResp,
              panelResp,
            ] = await Promise.all([
              useQuery({
                query: graphql(/* GraphQL */`
                  query PageCalendarEventData($uid: String!) {
                    calendarItem(uid: $uid) {
                      hasEvent
                      type
                    }
                    calendarItemCompanyUid(uid: $uid)
                  }
                `),
                variables: { uid },
              })().then((r) => r?.data),
              useQuery({
                query: graphql(/* GraphQL */`
                  query PageCalendarEventPanelData($uid: String!) {
                    calendarItem(uid: $uid) {
                      forPanel {
                        uid
                        name
                        description
                        reservation
                        companiesWithPanelists {
                          company {
                            uid
                            brandName
                            rasterLogo { fullUrl thumbUrl }
                          }
                          panelists {
                            firstName
                            lastName
                            bioHr
                            bioEn
                            photo { fullUrl thumbUrl }
                          }
                        }
                        event { start end location }
                      }
                    }
                  }
                `),
                variables: { uid },
              })().then((r) => r?.data),
            ]);

            if (routeResp) {
              routeState.value = routeResp;
            }
            if (panelResp) {
              panelState.value = panelResp;
            }
          },
          (route) => {
            const uid = route.params.uid as string;
            const data = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", uid ])).value;

            if (!data?.calendarItem) {
              return navigateTo({ name: "schedule" });
            }

            if ("panel" === data.calendarItem.type) {
              return;
            }

            return navigateTo({
              name: "company-uid",
              params: { uid: data.calendarItemCompanyUid },
              query: { tab: data.calendarItem.type },
            });
          },
        ],
      });

      const route = useRoute();

      const routeState = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", route.params.uid ]), () => null);
      const panelState = useState<IPageCalendarEventPanelDataQuery | null>(JSON.stringify([ "calendar-item-panel", route.params.uid ]), () => null);

      return {
        eventType: computed(() => routeState.value?.calendarItem?.type ?? null),
        panelData: computed(() => panelState.value?.calendarItem?.forPanel ?? null),
      };
    },
  });
</script>
