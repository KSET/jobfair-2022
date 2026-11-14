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

    <nav :class="$style.industryNav">
      <a
        v-for="group in participantGroups"
        :key="group.id"
        :href="`#${ group.id }`"
        class="p-button p-button-outlined p-button-sm"
      >
        <template v-if="group.name !== null">
          {{ group.name }}
        </template>
        <translated-text v-else-if="noIndustryHasKey" :trans-key="NO_INDUSTRY_KEY" />
        <template v-else>
          {{ noIndustryFallback }}
        </template>
        &nbsp;({{ group.participants.length }})
      </a>
    </nav>

    <section
      v-for="group in participantGroups"
      :id="group.id"
      :key="group.id"
      :class="$style.industrySection"
    >
      <h2>
        <template v-if="group.name !== null">
          {{ group.name }}
        </template>
        <translated-text v-else-if="noIndustryHasKey" :trans-key="NO_INDUSTRY_KEY" />
        <template v-else>
          {{ noIndustryFallback }}
        </template>
      </h2>

      <div :class="$style.companyGrid">
        <NuxtLink
          v-for="participant in group.participants"
          :key="participant.uid"
          :aria-label="participant.brandName"
          :class="$style.companyTile"
          :title="participant.titleText"
          :to="{ name: 'company-uid', params: { uid: participant.uid } }"
        >
          <img
            v-if="participant.rasterLogo?.fullUrl"
            :ref="(el) => registerLogo(participant.uid, el)"
            :alt="`${participant.brandName} logo`"
            :class="$style.companyLogo"
            :src="participant.rasterLogo.fullUrl"
            :style="logoStyle(participant.uid)"
            decoding="async"
            draggable="false"
            loading="lazy"
            @load="registerLogo(participant.uid, $event.target)"
          >
          <span
            v-else
            :class="$style.companyName"
            v-text="participant.brandName"
          />
        </NuxtLink>
      </div>
    </section>
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

  if (!participantsShown.value) {
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
            industry {
              name
            }
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

  type Participant = (typeof participants)[number];

  type ParticipantGroup = {
    id: string,
    name: string | null,
    participants: Participant[],
  };

  const NO_INDUSTRY_KEY = "participants.industry.none";
  const NO_INDUSTRY_ID = "industry--none";
  const INDUSTRY_SORT_LOCALE = "hr";

  const noIndustryHasKey = computed(() => translationsStore.hasTranslation(NO_INDUSTRY_KEY) || translationsStore.isEditable);
  const noIndustryFallback = computed(() => (Language.HR === translationsStore.currentLanguage ? "Ostalo" : "Other"));

  const industrySlug = (name: string) =>
    name
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .normalize("NFD")
      .replace(/[\u0300-\u036F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ;

  const participantGroups = computed(() => {
    const byIndustry = new Map<string | null, Participant[]>();
    for (const participant of participants) {
      const name = participant.industry?.name?.trim() || null;
      const group = byIndustry.get(name);

      if (group) {
        group.push(participant);
      } else {
        byIndustry.set(name, [ participant ]);
      }
    }

    const usedIds = new Set<string>([ NO_INDUSTRY_ID ]);
    const uniqueId = (name: string, index: number) => {
      const base = `industry-${ industrySlug(name) || index }`;
      let id = base;
      for (let n = 2; usedIds.has(id); n++) {
        id = `${ base }-${ n }`;
      }
      usedIds.add(id);
      return id;
    };

    const groups: ParticipantGroup[] =
      [ ...byIndustry.entries() ]
        .filter((entry): entry is [ string, Participant[] ] => null !== entry[0])
        .sort(([ a ], [ b ]) => a.localeCompare(b, INDUSTRY_SORT_LOCALE))
        .map(([ name, list ], index) => ({
          id: uniqueId(name, index),
          name,
          participants: list,
        }))
    ;

    const withoutIndustry = byIndustry.get(null);
    if (withoutIndustry?.length) {
      groups.push({
        id: NO_INDUSTRY_ID,
        name: null,
        participants: withoutIndustry,
      });
    }

    return groups;
  });

  const LOGO_BASE_HEIGHT = 120;
  const LOGO_MAX_HEIGHT = 110;
  const LOGO_MIN_HEIGHT = 36;

  const logoRatios = ref<Record<string, number>>({});

  const registerLogo = (uid: string, el: unknown) => {
    if (!(el instanceof HTMLImageElement) || !el.complete || !el.naturalHeight) {
      return;
    }

    const ratio = el.naturalWidth / el.naturalHeight;
    if (logoRatios.value[uid] !== ratio) {
      logoRatios.value[uid] = ratio;
    }
  };

  const logoStyle = (uid: string) => {
    const ratio = logoRatios.value[uid];
    if (!ratio) {
      return undefined;
    }

    const height = Math.min(LOGO_MAX_HEIGHT, Math.max(LOGO_MIN_HEIGHT, LOGO_BASE_HEIGHT / Math.sqrt(ratio)));

    return { height: `${ height.toFixed(1) }px` };
  };

  const toTop10 = (
    participants: {
      uid: string,
      brandName: string,
      ratings: {
        averageRating: number,
        ratingCount?: number | null,
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
          ratingCount: rating.ratingCount ?? 0,
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

  const refreshTop10 = async () => {
    const res = await ratingsQuery().then((res) => res?.data);

    if (!res) {
      return;
    }

    top10.value = toTop10(res.participants);
  };

  let ratingsInterval: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    ratingsInterval = setInterval(() => {
      void refreshTop10();
    }, 8000 + Math.random() * 6000);
  });

  onBeforeUnmount(() => {
    clearInterval(ratingsInterval);
  });

  const formatNumber = (x: number) => x.toLocaleString(translationsStore.currentLanguageIso, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .industryNav {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    margin-bottom: 2rem;
  }

  .industrySection {
    margin-bottom: 2.5rem;
    scroll-margin-top: calc(#{$nav-height} + 1rem);
  }

  .companyGrid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));

    @include media(sm) {
      gap: .75rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .companyTile {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    padding: 1rem;
    text-decoration: none;

    @include media(sm) {
      height: 120px;
      padding: .5rem;
    }
  }

  .companyLogo {
    display: block;
    width: auto;
    max-width: 100%;
    height: 60px;
    max-height: 100%;
    object-fit: contain;
  }

  .companyName {
    font-weight: 600;
    text-align: center;
    color: $fer-dark-blue;
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
