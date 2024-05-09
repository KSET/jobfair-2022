<template>
  <AppMaxWidthContainer>
    <h1>Rezultati glasanja</h1>

    <div
      :style="{
        display: 'grid',
        'grid-template-columns': `repeat(${totalVotes}, minmax(0, 1fr))`,
        'border-radius': '4px',
        'overflow': 'clip',
      }"
    >
      <div
        v-for="vote of voteResults"
        :key="vote.option"
        :data-option="vote.option"
        :class="$style.result"
        :style="{
          'grid-column': `span ${vote.voteCount}`,
        }"
        v-text="`${Math.round(vote.voteCount / totalVotes * 100)}%`"
      />
    </div>

    <div>
      <h3>Komentari</h3>

      <div class="flex flex-column gap-4">
        <Panel v-for="comment in comments" :key="comment.id" :header="comment.forUser.name" toggleable>
          <template #icons>
            <Button class="p-panel-header-icon p-link mr-2" severity="error" icon="pi pi-trash" :loading="comment.isLoading" @click.prevent="handleCommentDelete(comment.id)" />
          </template>

          <template #footer>
            <div class="flex flex-wrap align-items-center justify-content-between gap-3">
              <span class="ml-auto" v-text="comment.createdAt.toLocaleString('hr-HR')" />
            </div>
          </template>

          <div v-text="comment.comment" />
        </Panel>
      </div>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import Button from "primevue/button";
  import Panel from "primevue/panel";
  import {
    graphql,
  } from "~/graphql/client";
  import type {
    Dict,
  } from "~/helpers/type";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  const translationsStore = useTranslationsStore();
  const seasonsStore = useSeasonsStore();
  const confirm = useConfirm();

  const season = computed(() => seasonsStore.season!);

  const pageDataQuery = await useQuery({
    query: graphql(/* GraphQL */ `
    query PageAdminSeasonLiveVoteResults_Data($seasonUid: String!) {
      liveVoteResults(seasonUid: $seasonUid) {
        option
        voteCount
      }

      liveVoteComments(seasonUid: $seasonUid) {
        id
        comment
        createdAt
        forUser {
          name
        }
      }
    }`),
    variables: {
      seasonUid: season.value.uid!,
    },
  });

  const deleteCommentQuery = useMutation(graphql(/* GraphQL */ `
    mutation PageAdminSeasonLiveVoteResults_DeleteComment($commentId: Int!) {
      deleteLiveVoteComment(commentId: $commentId)
    }
  `));

  const handleCommentDelete = (commentId: number) => {
    const comment = comments.value.find((x) => x.id === commentId);

    if (!comment) {
      return;
    }

    const handle = async () => {
      comment.isLoading = true;
      const res = await deleteCommentQuery({
        commentId,
      }).then((res) => res?.data?.deleteLiveVoteComment);

      if (!res) {
        comment.isLoading = false;
      }
    };

    confirm.require({
      header: `${ translationsStore.translation("form.delete") }?`,
      acceptLabel: translationsStore.translation("form.delete"),
      acceptClass: "p-button-danger",
      rejectLabel: translationsStore.translation("form.cancel"),
      rejectClass: "p-button-secondary p-button-outlined",
      accept: () => void handle(),
    });
  };

  const loadPageData = async () => {
    const val = await pageDataQuery().then((res) => res?.data);
    if (!val) {
      return null;
    }

    return {
      ...val,
      liveVoteComments: val.liveVoteComments.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        isLoading: false,
      })),
    };
  };

  const initialData = await loadPageData();

  if (!initialData) {
    throw createError({ statusCode: 500, statusMessage: "Could not load data" });
  }

  const pageData = ref(initialData);

  const voteResults = computed(() => pageData.value.liveVoteResults);
  const comments = computed(() => pageData.value.liveVoteComments);
  const totalVotes = computed(() => voteResults.value.reduce((acc, x) => acc + x.voteCount, 0));

  const refreshPageData = async () => {
    const val = await loadPageData();

    if (val) {
      pageData.value = val;
    }

    return val;
  };

  onMounted(() => {
    clearInterval((window as unknown as Dict<number>).___LIVE_VOTE_REFRESH_INTERVAL);
    (window as unknown as Dict).___LIVE_VOTE_REFRESH_INTERVAL = setInterval(
      () => void refreshPageData(),
      1500,
    );
  });
</script>


<style lang="scss" module>
  @import "assets/styles/include";
  .result {
    color: $fer-white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 1px 1px 4px $fer-black;
    padding: .5rem 0;

    &[data-option="for"] {
      background-color: $fer-yellow;
    }

    &[data-option="against"] {
      background-color: $fer-dark-blue;
    }
  }

  :global(.p-panel-footer) {
    padding-top: 0;
  }
</style>

