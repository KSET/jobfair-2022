<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="participants.header" />
    </h1>

    <h3>
      <translated-text trans-key="participants.subheader" />
    </h3>

    <p>
      <translated-text trans-key="participants.text" />
    </p>

    <div :class="$style.companyGrid">
      <div
        v-for="participant in participants"
        :key="participant.uid"
        :class="$style.companyContainer"
      >
        <NuxtLink
          :to="{ name: 'company-uid', params: { uid: participant.uid } }"
        >
          <AppImg
            :alt="`${participant.brandName} logo`"
            :lazy-src="participant.rasterLogo?.thumbUrl"
            :src="participant.rasterLogo?.fullUrl ?? ''"
            :title="participant.titleText"
            aspect-ratio="1.78"
            contain
          />
        </NuxtLink>
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts" setup>
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";
  import {
    computed,
    useQuery,
    createError,
  } from "#imports";
  import AppImg from "~/components/util/app-img.vue";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    // eslint-disable-next-line camelcase
    IPageParticipants_BaseQuery,
  } from "~/graphql/schema";

  // eslint-disable-next-line camelcase
  type QParticipant = IPageParticipants_BaseQuery["participants"][number];

  useTitle("participants.header");

  const seasonsStore = useSeasonsStore();
  const translationsStore = useTranslationsStore();

  const participantsShown = computed(() => seasonsStore.areParticipantsShown);

  if (!participantsShown) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  const getParticipantTitleText =
    ({
      brandName,
      descriptionEn,
      descriptionHr,
    }: QParticipant) => {
      const separator = "----------";
      const description =
        translationsStore.currentLanguage === Language.HR
          ? descriptionHr
          : descriptionEn
      ;

      return `${ brandName }\n${ separator }\n${ description }`;
    }
  ;

  const withTitleText =
    (item: QParticipant) => ({
      ...item,
      titleText: getParticipantTitleText(item),
    })
  ;

  const participants =
    await useQuery({
      query: graphql(/* GraphQL */ `
        query PageParticipants_Base {
          participants {
            uid
            website
            brandName
            descriptionEn
            descriptionHr
            logoHidden
            rasterLogo {
                thumbUrl
                fullUrl
            }
          }
        }
      `),
    })()
      .then((x) => x?.data?.participants ?? [])
      .then((x) => x.filter((x) => !x.logoHidden))
      .then((x) => x.map(withTitleText))
  ;
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .companyGrid {
    display: grid;
    gap: 1em;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  .companyContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
