<template>
  <div class="relative">
    <div
      :class="$style.container"
      class="relative"
      :style="{
        'grid-template-columns': `repeat(${totalVotes}, minmax(0, 1fr))`,
      }"
    >
      <div
        v-for="option in [...liveVoteResults].reverse()"
        :key="option.option"
        :data-option="option.option"
        :class="$style.result"
        :style="{
          'grid-column': `span ${option.voteCount}`,
        }"
        v-text="`${Math.round(option.voteCount / totalVotes * 100)}%`"
      />

      <div class="absolute" style="height: 50%; width: 50%; top: 0;">
        <app-img
          :src="VisualLeft"
          alt="Contact"
          contain
        />
      </div>
      <div class="absolute" style="height: 35%; width: 25%; bottom: 0; right: 0;">
        <app-img
          :src="VisualRight"
          alt="Contact"
          contain
        />
      </div>
    </div>
    <div :class="$style.qrContainer">
      <div>
        <img :src="`/api/i/qr/link?relativeUrl=${encodeURIComponent(`/live-vote/${season.uid!}/`)}`">
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    graphql,
  } from "~/graphql/client";
  import type {
    Dict,
  } from "~/helpers/type";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  import VisualLeft from "~/assets/images/page/live-vote/visual-left.png";
  import VisualRight from "~/assets/images/page/live-vote/visual-right.png";

  definePageMeta({
    layout: "empty",
  });

  const seasonsStore = useSeasonsStore();
  const season = computed(() => seasonsStore.season!);

  const liveVoteResultsQuery = useQuery({
    query: graphql(/* GraphQL */ `
    query PageLiveVoteSeasonViewLiveVoteResults_LiveVoteResults($seasonUid: String!) {
      liveVoteResults(seasonUid: $seasonUid) {
        option
        voteCount
      }
    }
    `),
    variables: {
      seasonUid: season.value.uid!,
    },
  });

  const liveVoteResults = ref([] as NonNullable<NonNullable<Awaited<ReturnType<typeof liveVoteResultsQuery>>>["data"]>["liveVoteResults"]);
  const totalVotes = computed(() => liveVoteResults.value.reduce((acc, x) => acc + x.voteCount, 0));

  const updateLiveVoteResults = async () => {
    const res = await liveVoteResultsQuery().then((res) => res?.data?.liveVoteResults);

    if (res) {
      liveVoteResults.value = res;
    }
  };

  await updateLiveVoteResults();
  onMounted(() => {
    clearInterval((window as unknown as Dict<number | undefined>).___LIVE_VOTE_REFRESH_INTERVAL);
    (window as unknown as Dict).___LIVE_VOTE_REFRESH_INTERVAL = setInterval(
      () => {
        void updateLiveVoteResults();
      },
      1000 + 1500 * Math.random(),
    );
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    display: grid;
    min-height: 100vh;
    background-color: $fer-black;
  }

  .result {
    color: $fer-white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: max(4.5rem, 8vw);
    text-shadow: 1px 1px 4px $fer-black;
    max-height: 70vh;

    &[data-option="for"] {
      background-color: $fer-yellow;
    }

    &[data-option="against"] {
      background-color: $fer-dark-blue;
    }
  }

  .qrContainer {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 30vh;
    display: flex;

    > div {
      margin: 0 auto;
      height: 100%;

      > img {
        aspect-ratio: 1;
        height: 100%;
        border-radius: 4px 4px 0 0;
        background: $fer-white;
        object-fit: contain;
        padding: 8px;
        object-postition: 50% 50%;
      }
    }
  }
</style>
