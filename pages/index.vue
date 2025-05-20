<template>
  <div :class="$style.container">
    <div :class="$style.heroContainer">
      <div :class="$style.heroSizer" />
      <div :class="$style.heroImage" />
      <div :class="$style.heroContent">
        <img
          :class="$style.heroContentImage"
          alt="Job Fair"
          src="~/assets/images/logo/jobfair.png"
        >
        <h3 v-if="timeUntilNextEvent > 60" :class="$style.heroContentSupertitle">
          {{ timeUntilNextEventFormatted }}
        </h3>
        <h3 :class="$style.heroContentSupertitle">
          <translated-text trans-key="index.hero.date" />
        </h3>
        <nuxt-link
          v-if="!isLoggedIn"
          :class="$style.heroContentJoinNow"
          :to="joinNowRoute"
        >
          <p-button :class="$style.secondary">
            <translated-text trans-key="button.joinNow" />
          </p-button>
        </nuxt-link>
        <nuxt-link
          v-if="hasCompany && applicationsOpen"
          :class="$style.heroContentJoinNow"
          :to="{ name: 'profile-me-company-signup' }"
        >
          <p-button :class="$style.secondary">
            <translated-text trans-key="button.applyForSeason" />&nbsp;<strong v-text="currentSeason.name" />
          </p-button>
        </nuxt-link>
      </div>
    </div>

    <div :class="[$style.sectionContainer, $style.sectionNewsContainer]">
      <div class="grid">
        <div class="col-12">
          <h2 :class="$style.header">
            <translated-text trans-key="index.news.header" />
          </h2>
        </div>

        <div class="col-12">
          <div class="grid">
            <div
              v-for="newsItem in news"
              :key="newsItem.id"
              :class="$style.newsItemContainer"
              class="col-12 md:col-4"
            >
              <news-card
                :news-item="newsItem"
              />
            </div>
          </div>
        </div>

        <div class="col-12 text-center">
          <nuxt-link
            :to="{ name: 'news' }"
          >
            <p-button class="p-button-outlined p-button-secondary">
              <translated-text trans-key="index.news.learnMore" />
              <icon-chevron-right />
            </p-button>
          </nuxt-link>
        </div>
      </div>
    </div>

    <div :class="[ $style.sectionContainer, $style.dark ]">
      <div class="grid">
        <div class="col-12">
          <h2 :class="$style.header">
            <translated-text trans-key="index.gallery.header" />
          </h2>
        </div>

        <div class="col-12">
          <div class="grid">
            <div
              v-for="galleryItem in galleryImages"
              :key="galleryItem.url"
              class="col-6 md:col-4"
            >
              <app-img
                :src="galleryItem.url"
                alt="img"
                aspect-ratio="1.95"
                class="border-round"
              />
            </div>
          </div>
        </div>

        <div class="col-12 text-center">
          <nuxt-link
            :to="{ name: 'press', hash: '#gallery-container' }"
          >
            <p-button class="p-button-outlined">
              <translated-text trans-key="index.gallery.showMore" />
              <icon-chevron-right />
            </p-button>
          </nuxt-link>
        </div>
      </div>
    </div>

    <div
      v-if="sponsorsShown && projectFriends.length > 0"
      :class="$style.sectionContainer"
    >
      <div class="grid">
        <div class="col-12">
          <h2 :class="$style.header">
            <translated-text trans-key="index.projectFriends.header" />
          </h2>
          <h3 :class="$style.subHeader">
            <translated-text trans-key="index.projectFriends.subheader" />
          </h3>
        </div>

        <div class="col-12">
          <div :class="$style.companyGrid">
            <div
              v-for="projectFriend in projectFriends"
              :key="projectFriend.uid"
              :class="$style.companyGridCell"
            >
              <a
                :href="projectFriend.url"
                :title="projectFriend.name"
                target="_blank"
              >
                <app-img
                  :alt="`${projectFriend.name} logo`"
                  :lazy-src="projectFriend.photo.thumbUrl"
                  :src="projectFriend.photo.fullUrl"
                  aspect-ratio="1.78"
                  contain
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="partnersShown && mediaPartners.length > 0"
      :class="$style.sectionContainer"
    >
      <div class="grid">
        <div class="col-12">
          <h2 :class="$style.header">
            <translated-text trans-key="index.mediaPartners.header" />
          </h2>
          <h3 :class="$style.subHeader">
            <translated-text trans-key="index.mediaPartners.subheader" />
          </h3>
        </div>

        <div class="col-12">
          <div :class="$style.companyGrid">
            <div
              v-for="mediaPartner in mediaPartners"
              :key="mediaPartner.uid"
              :class="$style.companyGridCell"
            >
              <a
                :href="mediaPartner.url"
                :title="mediaPartner.name"
                target="_blank"
              >
                <app-img
                  :alt="`${mediaPartner.name} logo`"
                  :lazy-src="mediaPartner.photo.thumbUrl"
                  :src="mediaPartner.photo.fullUrl"
                  aspect-ratio="1.78"
                  contain
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import NewsCard from "~/components/news/news-card.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    dotGet,
    limitLength,
  } from "~/helpers/data";
  import AppImg from "~/components/util/app-img.vue";
  // noinspection TypeScriptCheckImport
  import IconChevronRight from "~icons/ep/arrow-right";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useJoinNowRoute,
  } from "~/composables/useJoinNowRoute";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useGalleryStore,
  } from "~/store/gallery";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    type IPageIndexDataQuery,
    type IPageIndexDataQueryVariables,
    PageIndexData,
  } from "~/graphql/schema";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useQuery,
  } from "~/composables/useQuery";

  const msToHuman = (ms: number) => {
    const s = Math.floor((ms) / 1000) % 60;
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const values = [
      d,
      h,
      m,
      s,
    ];

    return (
      values
        .map((x) => x.toFixed(0).padStart(2, "0"))
        .join(":")
    );
  };

  export default defineComponent({
    name: "PageIndex",

    components: {
      TranslatedText,
      AppImg,
      NewsCard,
      IconChevronRight,
    },

    async setup() {
      const translationsStore = useTranslationsStore();
      const newsStore = useNewsStore();
      const userStore = useUserStore();
      const galleryStore = useGalleryStore();
      const joinNowRoute = useJoinNowRoute();
      const seasonsStore = useSeasonsStore();

      const timeUntilNextEvent = ref(new Date("2025-05-21T11:00:00+02:00").getTime() - Date.now());
      const timeUntilNextEventInterval = ref(null as null | number | NodeJS.Timeout);
      const timeUntilNextEventFormatted = computed(() => msToHuman(timeUntilNextEvent.value));

      onMounted(() => {
        clearInterval(timeUntilNextEventInterval.value as never);
        timeUntilNextEventInterval.value = setInterval(() => {
          timeUntilNextEvent.value = new Date("2025-05-21T11:00:00+02:00").getTime() - Date.now();
        }, 798);
      });

      const initialData = await useQuery<IPageIndexDataQuery, IPageIndexDataQueryVariables>({
        query: PageIndexData,
        variables: {
          language: translationsStore.currentLanguage,
        },
      })().then((resp) => resp?.data);

      newsStore.setNews(initialData?.news ?? []);
      const news = computed(() => limitLength(3)(newsStore.items));

      galleryStore.setGalleryImages(initialData?.galleryImages ?? []);
      const galleryImages = computed(() => limitLength(6)(galleryStore.items));

      return {
        isLoggedIn: computed(() => userStore.isLoggedIn),
        hasCompany: computed(() => userStore.hasCompany),
        currentSeason: computed(() => seasonsStore.currentSeason),
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        partnersShown: computed(() => seasonsStore.arePartnersShown),
        sponsorsShown: computed(() => seasonsStore.areSponsorsShown),
        news,
        galleryImages,
        projectFriends: initialData?.sponsors ?? [],
        mediaPartners: initialData?.partners ?? [],
        joinNowRoute,
        dotGet,
        timeUntilNextEventFormatted,
        timeUntilNextEvent,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:math";
  @use "sass:color";
  @import "assets/styles/include/all";

  $section-spacing: 2rem;
  $width-padding: 1rem;
  $breakpoint: md;

  .container {
    flex: 1;

    .secondary {
      color: $fer-black;

      &:hover {
        color: $fer-black;
      }
    }

    .heroContainer {
      $image-aspect-ratio: math.div(2048, 1365);

      font-size: 4rem;
      position: relative;
      display: flex;
      flex: 1 0 auto;

      @include media(md) {
        font-size: 2rem;
      }

      .heroSizer {
        padding-bottom: #{math.div(1, $image-aspect-ratio) * 100%};
      }

      .heroImage {
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: color.adjust($fer-dark-blue, $alpha: -.4);

        // noinspection CssUnknownTarget
        background-image: url("@/assets/images/page/index/bg.jpg");
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
      }

      .heroContent {
        z-index: 1;
        flex: 1 0 0;
        max-width: $content-max-width;
        margin: 8rem auto 0;
        padding: 0 #{$width-padding};
        text-align: right;

        @include media(md) {
          margin-top: #{$width-padding};
        }

        > * {
          line-height: 1.1em;
        }

        .heroContentSupertitle {
          font-size: .4em;
          font-weight: bold;
          margin: 0;
          transition-property: margin-bottom;
          text-transform: capitalize;
          color: $fer-yellow;

          @include media(md) {
            margin-bottom: 1rem;
          }
        }

        .heroContentJoinNow {
          font-size: .9rem;
          transition-property: font-size;

          @include media(md) {
            font-size: .625rem;
          }
        }

        .heroContentImage {
          width: 30%;
          transition-property: width;

          @include media(md) {
            width: 42%;
          }
        }

        .heroContentSubtitle {
          font-size: .75em;
          font-weight: bold;
          margin-top: -.1em;
          margin-bottom: 0;
          text-transform: capitalize;
          color: $fer-yellow;
        }
      }
    }

    .sectionContainer {
      padding: 0 #{$width-padding} $section-spacing;

      .header {
        font-size: 2.5rem;
        margin: 2rem;
        text-align: center;
        color: $fer-dark-blue;
      }

      &.dark {
        color: $fer-white;
        background-color: $fer-dark-blue;

        .header {
          color: $fer-yellow;
        }
      }

      .subHeader {
        font-size: 1.25rem;
        font-weight: normal;
        text-align: center;
        color: $fer-black;
      }

      .header + .subHeader {
        margin-top: -.5rem;
      }

      > * {
        max-width: $content-max-width;
        margin: 0 auto;
      }
    }

    .sectionNewsContainer {

      .newsItemContainer {
        display: flex;

        @include media(sm) {

          &:not(:first-child) {
            display: none;
          }

        }
      }
    }

    .companyGrid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-row-gap: 1rem;
      grid-column-gap: 2.5rem;

      @include media(lg) {
        grid-column-gap: 2.25rem;
        grid-template-columns: repeat(4, 1fr);
      }

      @include media(md) {
        grid-column-gap: 2rem;
        grid-template-columns: repeat(3, 1fr);
      }

      @include media(sm) {
        grid-column-gap: 1.5rem;
        grid-template-columns: repeat(2, 1fr);
      }

      .companyGridCell {
        padding: 0;

        > a {
          display: inherit;
          border: 1px dashed transparent;
          border-radius: 4px;

          &:hover {
            border-color: color.adjust($fer-off-gray, $lightness: -10%);
          }
        }
      }
    }
  }
</style>
