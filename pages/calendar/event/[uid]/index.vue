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
    onBeforeMount,
    useQuery,
    useRoute,
    useRouter,
  } from "#imports";
  import {
    ICalendarItem,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageCalendarEventRedirector",

    async setup() {
      const route = useRoute();
      const router = useRouter();

      onBeforeMount(async () => {
        const route =
          resp
            ? router.resolve({
              name: "company-uid",
              params: {
                uid: resp.calendarItemCompanyUid,
              },
              query: {
                tab: resp.calendarItem.type,
              },
            })
            : router.resolve({
              name: "schedule",
            })
        ;
        await router.replace(route);
      });

      const resp = await useQuery<{ calendarItem: Pick<ICalendarItem, "hasEvent" | "type">, calendarItemCompanyUid: string | null, }, { uid: string, }>({
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

      return {};
    },
  });
</script>
