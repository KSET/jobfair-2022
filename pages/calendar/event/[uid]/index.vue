<template>
  <div>
    Loading...
  </div>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
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

  export default defineComponent({
    name: "PageCalendarEventRedirector",

    setup() {
      type TData = { calendarItem: Pick<ICalendarItem, "hasEvent" | "type">, calendarItemCompanyUid: string | null, };

      definePageMeta({
        title: "Redirecting...",
        middleware: [
          async (route) => {
            const data = useState<TData | null>(JSON.stringify([ "calendar-item", route.params.uid ]));

            const resp = await useQuery<TData, { uid: string, }>({
              query: gql`
                query Data($uid: String!) {
                  calendarItem(uid: $uid) {
                      hasEvent
                      type
                  }
                  calendarItemCompanyUid(uid: $uid)
                }
              `,
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
