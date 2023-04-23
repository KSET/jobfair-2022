<template>
  <div>
    Loading...
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    definePageMeta,
    navigateTo,
    useQuery,
    useState,
  } from "#imports";
  import {
    ICalendarItem,
  } from "~/graphql/schema";
  import {
    graphql,
  } from "~/graphql/client";

  export default defineComponent({
    name: "PageCalendarEventRedirector",

    setup() {
      type TData = { calendarItem: Pick<ICalendarItem, "hasEvent" | "type">, calendarItemCompanyUid: string | null, };

      definePageMeta({
        title: "Redirecting...",
        middleware: [
          async (route) => {
            const data = useState<TData | null>(JSON.stringify([ "calendar-item", route.params.uid ]));

            const resp = await useQuery({
              query: graphql(/* GraphQL */`
                query PageCalendarEventData($uid: String!) {
                  calendarItem(uid: $uid) {
                      hasEvent
                      type
                  }
                  calendarItemCompanyUid(uid: $uid)
                }
              `),
              variables: {
                uid: route.params.uid as string,
              },
            })().then((resp) => resp?.data);

            if (resp) {
              data.value = resp;
            }
          },
          (route) => {
            const data = useState<TData | null>(JSON.stringify([ "calendar-item", route.params.uid ])).value;

            if (!data) {
              return navigateTo({
                name: "schedule",
              });
            }

            return navigateTo({
              name: "company-uid",
              params: {
                uid: data.calendarItemCompanyUid,
              },
              query: {
                tab: data.calendarItem.type,
              },
            });
          },
        ],
      });
    },
  });
</script>
