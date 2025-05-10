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
    type ICalendarItem,
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
                query PageScheduleAdditionalContentEventData($uid: String!) {
                  calendarItem(uid: $uid) {
                      hasEvent
                      type
                      forPanel {
                        name
                        description
                        companies {
                          booth
                        }
                      }
                  }
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

            console.log("Scedule", data);
          },
        ],
      });
    },
  });
</script>
