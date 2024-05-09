<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  const route = useRoute();
  const seasonsStore = useSeasonsStore();

  const seasonUid = route.params.season;
  if ("string" !== typeof seasonUid || !seasonUid) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  const res = await useQuery({
    query: graphql(`
    query PageLiveVoteSeason_Data($uid: String!) {
      season(uid: $uid) {
        uid
        name
        startsAt
        endsAt
        applicationsFrom
        applicationsUntil
        applicationsEditableFrom
        applicationsEditableUntil
        showParticipantsFrom
        showParticipantsUntil
        showPartnersFrom
        showPartnersUntil
        showSponsorsFrom
        showSponsorsUntil
        eventFrom
        eventUntil
        feedbackFrom
        feedbackUntil
        scheduleFrom
        scheduleUntil
      }
    }
    `),
    variables: {
      uid: seasonUid,
    },
  })();

  const season = res?.data?.season;

  if (!season) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  seasonsStore.setSeason(season);
</script>
