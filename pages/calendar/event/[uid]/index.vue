<template>
  <panel-event-view v-if="'panel' === eventType && panelData" :panel="panelData" />
  <other-content-event-view
    v-else-if="isOtherContentType && otherContentData"
    :other-content="otherContentData"
    :event-type="eventType"
  />
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
    type IPageCalendarEventOtherContentDataQuery,
  } from "~/graphql/schema";
  import {
    graphql,
  } from "~/graphql/client";
  import PanelEventView from "~/components/page/calendar/panel-event-view.vue";
  import OtherContentEventView from "~/components/page/calendar/other-content-event-view.vue";

  export default defineComponent({
    name: "PageCalendarEventDispatcher",

    components: {
      PanelEventView,
      OtherContentEventView,
    },

    setup() {
      definePageMeta({
        title: "Event",
        middleware: [
          async (route) => {
            const uid = route.params.uid as string;
            const routeState = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", uid ]));
            const panelState = useState<IPageCalendarEventPanelDataQuery | null>(JSON.stringify([ "calendar-item-panel", uid ]));
            const otherContentState = useState<IPageCalendarEventOtherContentDataQuery | null>(JSON.stringify([ "calendar-item-other-content", uid ]));

            const [
              routeResp,
              panelResp,
              otherContentResp,
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
              useQuery({
                query: graphql(/* GraphQL */`
                  query PageCalendarEventOtherContentData($uid: String!) {
                    calendarItem(uid: $uid) {
                      forOtherContent {
                        uid
                        nameHr
                        nameEn
                        descriptionHr
                        descriptionEn
                        subtype
                        reservation
                        event { start end location }
                        participants {
                          firstName
                          lastName
                          bioEn
                          bioHr
                          photo { fullUrl }
                        }
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
            if (otherContentResp) {
              otherContentState.value = otherContentResp;
            }
          },
          (route) => {
            const uid = route.params.uid as string;
            const data = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", uid ])).value;

            if (!data?.calendarItem) {
              return navigateTo({ name: "schedule" });
            }

            const { type } = data.calendarItem;

            if ("panel" === type) {
              return;
            }

            if ("hot-talk" === type || "loosen-up" === type || "debate" === type || "other" === type) {
              return;
            }

            return navigateTo({
              name: "company-uid",
              params: { uid: data.calendarItemCompanyUid },
              query: { tab: type },
            });
          },
        ],
      });

      const route = useRoute();

      const routeState = useState<IPageCalendarEventDataQuery | null>(JSON.stringify([ "calendar-item", route.params.uid ]), () => null);
      const panelState = useState<IPageCalendarEventPanelDataQuery | null>(JSON.stringify([ "calendar-item-panel", route.params.uid ]), () => null);
      const otherContentState = useState<IPageCalendarEventOtherContentDataQuery | null>(JSON.stringify([ "calendar-item-other-content", route.params.uid ]), () => null);

      const OTHER_CONTENT_TYPES = [ "hot-talk", "loosen-up", "debate", "other" ];

      return {
        eventType: computed(() => routeState.value?.calendarItem?.type ?? null),
        panelData: computed(() => panelState.value?.calendarItem?.forPanel ?? null),
        otherContentData: computed(() => otherContentState.value?.calendarItem?.forOtherContent ?? null),
        isOtherContentType: computed(() => {
          const type = routeState.value?.calendarItem?.type;
          return null !== type && undefined !== type && OTHER_CONTENT_TYPES.includes(type);
        }),
      };
    },
  });
</script>
