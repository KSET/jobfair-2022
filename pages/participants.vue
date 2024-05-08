<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="participants.header" />
    </h1>

    <div v-if="eventOngoing && top10.length >= 3">
      <h2>
        <translated-text trans-key="participants.top10.header" />
      </h2>

      <p>
        <translated-text trans-key="participants.top10.text" />
      </p>

      <table :class="$style.top10Table">
        <tbody>
          <tr v-for="(company, index) in top10" :key="company.uid" :class="$style.top10Row">
            <td :class="$style.top10Number" v-text="`${index + 1}.`" />
            <td :class="$style.top10Name">
              <NuxtLink :to="{ name: 'company-uid', params: { uid: company.uid, }, }">
                {{ company.brandName }}
              </NuxtLink>
            </td>
            <td :class="$style.top10Rating" v-text="`${formatNumber(company.rating!)} / 10`" />
          </tr>
        </tbody>
      </table>
    </div>

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
    type IPageParticipants_BaseQuery,
  } from "~/graphql/schema";

  // eslint-disable-next-line camelcase
  type QParticipant = IPageParticipants_BaseQuery["participants"][number];

  useTitle("participants.header");

  const seasonsStore = useSeasonsStore();
  const translationsStore = useTranslationsStore();

  const participantsShown = computed(() => seasonsStore.areParticipantsShown);
  const eventOngoing = computed(() => seasonsStore.isEventOngoing);

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
            ratings {
              averageRating
              ratingCount
              component
            }
          }
        }
      `),
    })()
      .then((x) => x?.data?.participants ?? [])
      .then((x) => x.filter((x) => !x.logoHidden))
      .then((x) => x.map(withTitleText))
  ;

  const toTop10 = (
    participants: {
      uid: string,
      brandName: string,
      ratings: {
        averageRating: number,
        component: string,
      }[],
    }[],
  ) =>
    participants
      .map((x) => {
        const rating = x.ratings.find((x) => "booth" === x.component);

        if (!rating) {
          return null;
        }

        return {
          uid: x.uid,
          brandName: x.brandName,
          rating: rating.averageRating,
          ratingCount: rating.ratingCount,
        };
      })
      .filter(Boolean)
      .filter((x) => 10 < x.ratingCount)
      .sort((lt, gt) => gt.rating - lt.rating)
      .slice(0, 10)
  ;

  const top10 = ref(toTop10(participants));

  const ratingsQuery = useQuery({
    query: graphql(/* GraphQL */ `
      query PageParticipants_Ratings {
        participants {
          uid
          brandName
          ratings {
            averageRating
            ratingCount
            component
          }
        }
      }
    `),
  });

  onMounted(() => {
    setInterval((async () => {
      const res = await ratingsQuery().then((res) => res?.data);

      if (!res) {
        return;
      }

      top10.value = toTop10(participants);
    }) as unknown as () => void, 8000 + Math.random() * 6000);
  });

  const formatNumber = (x: number) => x.toLocaleString(translationsStore.currentLanguageIso, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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

  .top10Table {
    font-size: 1.25rem;
    border-collapse: separate;
    border-spacing: 1rem 1rem;

    .top10Row:nth-of-type(1) {
      font-weight: bold;
      font-size: 1.5em;
    }

    .top10Row:nth-of-type(2) {
      font-size: 1.25em;
    }

    .top10Row:nth-of-type(3) {
      font-size: 1.1em;
    }

    .top10Name {
      font-weight: bold;
    }
  }
</style>
