<template>
  <AppMaxWidthContainer>
    <h1><TranslatedText trans-key="live-vote.header" /></h1>

    <div :class="$style.buttons" :data-vote="myVote">
      <Button
        size="large"
        :loading="isVoteLoading"
        @click.prevent="handleVote('for')"
      >
        <TranslatedText trans-key="live-vote.option.for" />
      </Button>

      <Button severity="secondary" size="large" :loading="isVoteLoading" @click.prevent="handleVote('against')">
        <TranslatedText trans-key="live-vote.option.against" />
      </Button>
    </div>

    <div class="mt-6">
      <h2 class="text-center">
        <TranslatedText trans-key="live-vote.comment" />
      </h2>

      <form class="flex flex-column" @submit.prevent="handleCommentSubmit">
        <Textarea
          v-model="commentModel"
          class="w-full"
          auto-resize
          maxlength="400"
          :disabled="isCommentLoading"
          aria-label="Comment"
        />
        <Button
          class="ml-auto mt-3"
          size="large"
          :disabled="!commentModel"
          type="submit"
          :loading="isCommentLoading"
          :label="translationsStore.translation('form.submit')"
        />
      </form>
    </div>

    <div v-if="myComments.length > 0" class="mt-6">
      <h2 class="text-center">
        <TranslatedText trans-key="live-vote.my-comments" />
      </h2>

      <div class="flex flex-column gap-2">
        <div v-for="comment in myComments" :key="comment.id" :class="$style.comment">
          {{ comment.comment }}

          <Button
            :class="$style.deleteButton"
            icon="pi pi-trash"
            severity="danger"
            aria-label="Delete"
            size="small"
            :loading="comment.isLoading"
            @click.prevent="handleCommentDelete(comment.id)"
          />
        </div>
      </div>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import Button from "primevue/button";
  import Textarea from "primevue/textarea";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  const translationsStore = useTranslationsStore();
  const seasonsStore = useSeasonsStore();
  const confirm = useConfirm();
  const toast = useToast();

  const season = computed(() => seasonsStore.season!);

  const isVoteLoading = ref(false);

  const isCommentLoading = ref(false);
  const commentModel = ref("");

  const pageData = await useQuery({
    query: graphql(/* GraphQL */ `
    query PageLiveVoteSeasonIndex_Data($seasonUid: String!) {
      myLiveVote(seasonUid: $seasonUid) {
        option
      }
      myLiveVoteComments(seasonUid: $seasonUid) {
        id
        comment
      }
    }
    `),
    variables: {
      seasonUid: season.value.uid!,
    },
  })().then((res) => res?.data);

  if (!pageData) {
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error, no page data" });
  }

  const myVote = ref(pageData.myLiveVote?.option);
  const myComments = ref(pageData.myLiveVoteComments.map((x) => ({
    ...x,
    isLoading: false,
  })));

  const deleteCommentQuery = useMutation(graphql(/* GraphQL */ `
    mutation PageLiveVoteSeasonIndex_DeleteComment($commentId: Int!) {
      deleteLiveVoteComment(commentId: $commentId)
    }
  `));

  const submitCommentQuery = useMutation(graphql(/* GraphQL */ `
    mutation PageLiveVoteSeasonIndex_SubmitComment($seasonUid: String!, $comment: String!) {
      createLiveVoteComment(seasonUid: $seasonUid, comment: $comment) {
        id
        comment
      }
    }
  `));

  const submitVoteQuery = useMutation(graphql(/* GraphQL */ `
    mutation PageLiveVoteSeasonIndex_SubmitVote($seasonUid: String!, $vote: String!) {
      createLiveVote(seasonUid: $seasonUid, vote: $vote) {
        option
      }
    }
  `));

  const handleVote = async (vote: "for" | "against") => {
    if (vote === myVote.value) {
      return;
    }

    isVoteLoading.value = true;
    const res = await submitVoteQuery({
      seasonUid: season.value.uid!,
      vote,
    }).then((res) => res?.data?.createLiveVote);
    isVoteLoading.value = false;

    if (!res) {
      toast.add({
        severity: "error",
        summary: "Something went wrong",
        detail: "Please try again later",
        life: 8000,
      });

      return;
    }

    myVote.value = res.option;
  };

  const handleCommentSubmit = async () => {
    isCommentLoading.value = true;
    const res = await submitCommentQuery({
      seasonUid: season.value.uid!,
      comment: commentModel.value,
    }).then((res) => res?.data?.createLiveVoteComment);
    isCommentLoading.value = false;

    if (!res) {
      toast.add({
        severity: "error",
        summary: "Something went wrong",
        detail: "Please try again later",
        life: 8000,
      });
      return;
    }

    myComments.value = [
      {
        ...res,
        isLoading: false,
      },
      ...myComments.value,
    ];
    commentModel.value = "";
  };

  const handleCommentDelete = (commentId: number) => {
    const comment = myComments.value.find((x) => x.id === commentId);

    if (!comment) {
      return;
    }

    const handle = async () => {
      comment.isLoading = true;
      const res = await deleteCommentQuery({
        commentId,
      }).then((res) => res?.data?.deleteLiveVoteComment);
      comment.isLoading = false;

      if (!res) {
        return;
      }

      myComments.value = myComments.value.filter((x) => x.id !== commentId);
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
</script>

<style lang="scss" module>
@use "sass:map";
@use "sass:color";
@import "assets/styles/include";

.buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  justify-content: space-between;
  gap: 2rem;
  font-size: min(5rem, 5vw);
  padding: 1rem;
  border-radius: 8px;

  &[data-vote="for"] {
    background-color: $fer-yellow;
  }

  &[data-vote="against"] {
    background-color: $fer-dark-blue;
  }
}

.comment {
  position: relative;
  padding: 1rem;
  padding-right: 4rem;
  border-radius: 4px;
  border: 1px solid #{color.adjust($fer-black, $alpha: -.6)};
  box-shadow: #{map.get($shadows, "shadow-1")};
}

.deleteButton {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 0 4px;
}
</style>
