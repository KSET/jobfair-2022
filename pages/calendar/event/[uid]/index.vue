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
    navigateTo,
    useQuery,
    useRoute,
  } from "#imports";
  import {
    ICalendarItem,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageCalendarEventRedirector",

    setup() {
      const route = useRoute();

      return useQuery<{ calendarItem: Pick<ICalendarItem, "hasEvent" | "type">, calendarItemCompanyUid: string | null, }, { uid: string, }>({
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
      })().then((resp) => resp?.data).then(async (resp) => {
        if (!resp) {
          await navigateTo({
            name: "schedule",
          });
        } else {
          await navigateTo({
            name: "company-uid",
            params: {
              uid: resp.calendarItemCompanyUid,
            },
            query: {
              tab: resp.calendarItem.type,
            },
          });
        }
      });
    },
  });
</script>
