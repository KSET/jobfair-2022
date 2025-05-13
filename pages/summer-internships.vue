<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="internships.header" />
    </h1>

    <h3>
      <translated-text trans-key="internships.subheader" />
    </h3>

    <p>
      <translated-text trans-key="internships.text" />
    </p>

    <div :class="$style.items">
      <div v-for="internship in internships" :key="internship.uid" :class="$style.item">
        <nuxt-link
          class="flex-1"
          :title="internship.description"
          :to="{
            name: 'company-uid',
            params: { uid: internship.company?.uid },
            query: { tab: 'internship' }
          }"
        >
          <p-button
            :class="[
              'p-button-text p-button-secondary h-full justify-content-start',
              $style.itemHeaderButton
            ]"
          >
            <div :class="$style.itemHeader">
              <template v-if="internship?.company">
                <template v-if="internship?.company">
                  <AppImg
                    v-for="company in [internship?.company]"
                    :key="company.uid"
                    :alt="company.brandName"
                    :aspect-ratio="16 / 9"
                    :class="$style.itemImage"
                    :lazy-src="company.rasterLogo?.thumbUrl"
                    :src="company.rasterLogo?.fullUrl ?? ''"
                    contain
                  />
                </template>
              </template>
              <p
                v-if="internship?.company"
                class="m-0 opacity-60 text-lg mt-2"
                v-text="internship?.company?.brandName"
              />
              <p class="m-0">
                <strong v-text="internship.position" />
              </p>
            </div>
          </p-button>
        </nuxt-link>
        <div :class="$style.itemContent">
          <dl>
            <dd class="flex gap-2 flex-wrap text-base align-items-center">
              <span :class="$style.text" v-text="toDateString(internship.workingPeriodStart)" />
              <span :class="$style.text">-</span>
              <span :class="$style.text" v-text="toDateString(internship.workingPeriodEnd)" />
              <span :class="$style.text">|</span>
              <span :class="$style.text" v-text="internship.duration" />
            </dd>
          </dl>
        </div>
        <div :class="$style.itemActions">
          <nuxt-link
            :to="{
              name: 'company-uid',
              params: { uid: internship.company?.uid },
              query: { tab: 'internship' }
            }"
            :class="$style.signupButton"
            role="button"
          >
            <translated-text trans-key="company.event.program.internship.more-info" />
          </nuxt-link>
        </div>
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
    Internships,
    type IInternshipsQuery,
    type IInternshipsQueryVariables,
  } from "~/graphql/schema";


  useTitle("internships.header");

  const seasonsStore = useSeasonsStore();
  const translationsStore = useTranslationsStore();

  const participantsShown = computed(() => seasonsStore.areParticipantsShown);

  if (!participantsShown) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  const InternshipsQuery = useQuery<
    IInternshipsQuery,
    IInternshipsQueryVariables
  >({
    query: Internships,
  });

  const resp = await InternshipsQuery().then((resp) => resp?.data || null);

  const internships = ref(resp?.internships || []);

  const toDateString = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
</script>

<style lang="scss" module>
@use "sass:map";
@use "sass:color";
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

.items {
  display: grid;
  padding: 1rem;
  background-color: $fer-off-gray;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));

  @include media(sm) {
    font-size: .9rem;
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .signupButton {
    font-size: 1.2rem;
    font-weight: bold;
    padding: .85rem 1rem;
    transition: background-color .2s ease;
  }

  .signupButton {
    background-color: $fer-yellow;

    span {
      color: $fer-white;
    }
  }

  .item {
    overflow: hidden;
    border-radius: 4px;
    background-color: $fer-white;
    box-shadow: #{map.get($shadows, "shadow-3")};
    display: flex;
    flex-direction: column;
  }
}

.item .itemHeader {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: .5rem;
}

.item .itemHeaderButton {
  font-size: 1.25rem;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  width: 100%;
  padding-inline: 1.5rem;
  text-align: left;
  color: $fer-dark-blue;
  border-radius: 0;
  gap: .5rem;
  appearance: none;
}

.item .itemHeaderButton :global(.p-carousel) {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.item .itemContent {
  padding: .5rem 1rem;

  dl {
    line-height: 1.5;
    margin: 0;

    dd {
      margin: 0;
    }
  }

  .text {
    opacity: .7;
    color: $fer-dark-blue;
  }

}

.item .itemContent .itemContentLabel {

  &::after {
    content: ":";
  }
}

.item .itemContent .itemContentText {
  font-weight: bold;
}

.item .itemImage {

  img {
    object-position: right;
  }
}

.item .itemActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: .5rem 1rem;
  gap: .5rem;
}

.item .signupButton,
.item .signoffButton {
  transition: background-color .2s ease;

  &:hover {
    transition: none;
  }
}

.item .signoffButton {
  background-color: $fer-dark-blue;

  &:hover {
    background-color: color.adjust($fer-dark-blue, $alpha: -.12);
  }
}
</style>
