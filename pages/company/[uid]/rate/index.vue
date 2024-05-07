<template>
  <AppMaxWidthContainer>
    <h1>
      <TranslatedText :trans-key="`company.rate.header.${component}`" />
      {{ company.brandName }}
    </h1>

    <form :class="$style.inputs" @submit.prevent="handleSubmit">
      <div :class="$style.input">
        <label for="rating" data-required>
          <TranslatedText trans-key="company.rate.rating" /><em>*</em>
        </label>
        <Rating
          id="rating"
          v-model="rating"
          :stars="10"
          :cancel="false"
          :class="$style.rating"
          :disabled="isLoading"
        >
          <template #onicon>
            <ImgJobfairTie :class="`w-full h-full ${$style.ratingIconOn}`" />
          </template>
          <template #officon>
            <ImgJobfairTie :class="`w-full h-full ${$style.ratingIconOff}`" />
          </template>
        </Rating>
        <span v-if="rating" class="text-center">{{ rating }}/7</span>
      </div>

      <div :class="$style.input">
        <label for="comment">
          <TranslatedText trans-key="company.rate.comment" />
        </label>
        <Textarea
          id="comment"
          v-model="comment"
          :disabled="isLoading"
          auto-resize
          rows="5"
          :maxlength="2048"
        />
      </div>

      <div class="flex">
        <Button
          v-if="exists"
          class="p-button-danger font-bold"
          type="button"
          :disabled="!rating"
          :loading="isLoading"
          @click.prevent="handleDelete"
        >
          <TranslatedText trans-key="form.delete" />
        </Button>

        <Button
          class="p-button-secondary font-bold ml-auto"
          type="submit"
          :disabled="!rating"
          :loading="isLoading"
        >
          <TranslatedText trans-key="form.save" />
        </Button>
      </div>
    </form>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import Button from "primevue/button";
  import Rating from "primevue/rating";
  import Textarea from "primevue/textarea";
  import ImgJobfairTie from "~/assets/images/icon/jobfair-tie.svg?component";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  const ALLOWED_TYPES = [ "booth", "talk", "workshop" ] as const;

  const route = useRoute();
  const companyStore = useCompanyStore();
  const translationsStore = useTranslationsStore();
  const toast = useToast();

  const company = computed(() => companyStore.companyInfo!);

  const component = route.query.type;
  const seasonUid = route.query.season;
  const companyUid = company.value.uid;

  if (!component || "string" !== typeof component || !ALLOWED_TYPES.includes(component)) {
    throw createError({ statusCode: 403, statusMessage: "Page Not Found" });
  }

  const title = computed(() => {
    const header = translationsStore.translation("company.rate.header");
    const type = translationsStore.translation(`company.rate.type.${ unref(component) }`);

    return `${ header } ${ company.value.brandName } ${ type }`;
  });

  useTitle(title, false);

  if (!seasonUid || "string" !== typeof seasonUid) {
    throw createError({ statusCode: 401, statusMessage: "Page Not Found" });
  }

  const pageData = await useQuery({
    query: graphql(/* GraphQL */ `
      query PageCompanyUidRate_Data($seasonUid: String!, $companyUid: String!, $component: String!) {
        userCompanyComponentRating(seasonUid: $seasonUid, companyUid: $companyUid, component: $component) {
          rating
          comment
        }
        currentSeason {
          eventFrom
          eventUntil
        }
      }
    `),
    variables: {
      seasonUid,
      companyUid,
      component,
    },
  })().then((res) => res?.data);

  const currentSeason = pageData?.currentSeason;

  if (!currentSeason || new Date(currentSeason.eventFrom) > new Date() || new Date(currentSeason.eventUntil) < new Date()) {
    throw createError({ statusCode: 405, statusMessage: "Page Not Found" });
  }

  const previousReview = pageData?.userCompanyComponentRating;

  const exists = ref(Boolean(previousReview));
  const rating = ref(previousReview?.rating);
  const comment = ref(previousReview?.comment);

  const isLoading = ref(false);

  const upsertRatingMutation = useMutation(graphql(/* GraphQL */ `
    mutation PageCompanyUidRate_Upsert($seasonUid: String!, $companyUid: String!, $component: String!, $rating: Int!, $comment: String) {
      upsertUserCompanyComponentRating(seasonUid: $seasonUid, companyUid: $companyUid, component: $component, rating: $rating, comment: $comment) {
        rating
        comment
      }
    }
  `));

  const deleteRatingMutation = useMutation(graphql(/* GraphQL */ `
    mutation PageCompanyUidRate_Delete($seasonUid: String!, $companyUid: String!, $component: String!) {
      deleteUserCompanyComponentRating(seasonUid: $seasonUid, companyUid: $companyUid, component: $component)
    }
  `));

  const confirm = useConfirm();

  const handleDelete = () => {
    const handle = async () => {
      isLoading.value = true;
      const resp = await deleteRatingMutation({
        seasonUid,
        companyUid,
        component,
      }).then((res) => res?.data?.deleteUserCompanyComponentRating ?? false);
      isLoading.value = false;

      if (!resp) {
        toast.add({
          severity: "error",
          summary: "Something went wrong",
          detail: "Please try again later",
          life: 8000,
        });
        return;
      }
      exists.value = false;
      rating.value = undefined;
      comment.value = null;
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

  watch(rating, async (newRating) => {
    const payload = {
      rating: newRating,
      comment: comment.value?.trim() ?? null,
    };

    if (!payload.rating) {
      return;
    }

    if (!payload.comment) {
      payload.comment = null;
    }

    const resp = await upsertRatingMutation({
      companyUid,
      seasonUid,
      component,
      rating: payload.rating,
      comment: payload.comment,
    }).then((res) => res?.data?.upsertUserCompanyComponentRating);

    if (!resp) {
      return;
    }

    rating.value = resp.rating;
    exists.value = true;
  });

  const handleSubmit = async () => {
    const payload = {
      rating: rating.value,
      comment: comment.value?.trim() ?? null,
    };

    if (!payload.rating) {
      return;
    }

    if (!payload.comment) {
      payload.comment = null;
    }

    payload.rating = Math.round(payload.rating);
    // payload.rating = Math.max(1, Math.min(7, payload.rating));

    isLoading.value = true;
    const resp = await upsertRatingMutation({
      companyUid,
      seasonUid,
      component,
      rating: payload.rating,
      comment: payload.comment,
    }).then((res) => res?.data?.upsertUserCompanyComponentRating);
    isLoading.value = false;

    if (!resp) {
      toast.add({
        severity: "error",
        summary: "Failed to submit feedback. Please try again later.",
        life: 8000,
      });

      return;
    }

    rating.value = resp.rating;
    comment.value = resp.comment;
    exists.value = true;

    toast.add({
      severity: "success",
      summary: "Feedback submitted",
      life: 5000,
    });
  };
</script>

<style module lang="scss">
@use "sass:color";
@import "assets/styles/include";

.inputs {
  display: flex;
  flex-flow: column;
  gap: 2rem;
}

.input {
  display: flex;
  flex-flow: column;
  gap: 1rem;

  > label {
    font-size: 1.2rem;
    text-align: center;
    font-weight: bold;

    &[data-required] {

      > em {
        color: $fer-error;
      }
    }
  }
}

.rating {
  gap: 2rem;
  justify-content: center;

  :global(.p-rating-item) {
    height: 100%;

    &:hover {

      svg:not(.ratingIconOn) > path {
        fill: color.adjust($fer-yellow, $saturation: -75%, $lightness: 25%) !important;
      }
    }
  }

  :global(.p-rating-item-active) .ratingIconOn {

    > path {
      fill: $fer-yellow !important;
    }
  }

  :global(.p-rating-item-active):hover ~ :global(.p-rating-item-active) {

    svg > path {
      fill: color.adjust($fer-yellow, $saturation: -55%, $lightness: 25%) !important;
    }
  }

  .ratingIconOff {

    > path {
      fill: $fer-gray !important;
    }
  }
}
</style>
