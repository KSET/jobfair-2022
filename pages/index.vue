<template>
  <div :class="$style.container">
    <div :class="$style.heroContainer">
      <div :class="$style.heroSizer" />
      <div :class="$style.heroImage" />
      <div :class="$style.heroContent">
        <h3 :class="$style.heroContentSupertitle">
          19. - 23.10. | FER, Zagreb
        </h3>
        <h1 :class="$style.heroContentTitle">
          JobFair
        </h1>
        <h2 :class="$style.heroContentSubtitle">
          Meetup
        </h2>
        <nuxt-link
          v-if="!isLoggedIn"
          :to="joinNowRoute"
          style="font-size: .9rem;"
        >
          <p-button :class="$style.secondary">
            <translated-text trans-key="button.joinNow" />
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
          <p-button class="p-button-outlined p-button-secondary">
            <translated-text trans-key="index.news.learnMore" />
            <icon-chevron-right />
          </p-button>
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
              v-for="galleryItem in gallery"
              :key="galleryItem.url"
              class="col-6 md:col-4"
            >
              <app-img
                :lazy-src="galleryItem.thumb"
                :src="galleryItem.url"
                alt="img"
                aspect-ratio="1.95"
                class="border-round"
              />
            </div>
          </div>
        </div>

        <div class="col-12 text-center">
          <p-button class="p-button-outlined">
            <translated-text trans-key="index.gallery.showMore" />
            <icon-chevron-right />
          </p-button>
        </div>
      </div>
    </div>

    <div :class="$style.sectionContainer">
      <div class="grid">
        <div class="col-12">
          <h2 :class="$style.header">
            <translated-text trans-key="index.participants.header" />
          </h2>
          <h3 :class="$style.subHeader">
            <translated-text trans-key="index.participants.subheader" />
          </h3>
        </div>

        <div class="col-12">
          <div :class="$style.companyGrid">
            <div
              v-for="participant in participants"
              :key="participant.id"
              :class="$style.companyGridCell"
            >
              <app-img
                :alt="`${participant.name} logo`"
                :lazy-src="participant.images.small.url"
                :src="participant.images.default.url"
                :title="getParticipantTitleText(participant)"
                aspect-ratio="1.78"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="$style.sectionContainer">
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
              :key="projectFriend.id"
              :class="$style.companyGridCell"
            >
              <app-img
                :alt="`${projectFriend.name} logo`"
                :lazy-src="projectFriend.images.lazySrc"
                :src="projectFriend.images.srcSet"
                aspect-ratio="1.78"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="$style.sectionContainer">
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
              :key="mediaPartner.id"
              :class="$style.companyGridCell"
            >
              <app-img
                :alt="`${mediaPartner.name} logo`"
                :lazy-src="mediaPartner.images.lazySrc"
                :src="mediaPartner.images.srcSet"
                aspect-ratio="1.78"
              />
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
    ref,
  } from "vue";
  import NewsCard from "~/components/news/news-card.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    dotGet,
    ensureArray,
    limitLength,
  } from "~/helpers/data";
  import AppImg from "~/components/util/app-img.vue";
  // noinspection TypeScriptCheckImport
  import IconChevronRight from "~icons/ep/arrow-right";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageIndex",

    components: {
      TranslatedText,
      AppImg,
      NewsCard,
      IconChevronRight,
    },

    async setup() {
      const newsStore = useNewsStore();
      const userStore = useUserStore();
      const joinNowRoute = useJoinNowRoute();

      const [
        news,
      ] = await Promise.all([
        newsStore
          .fetchNews()
          .then(ensureArray)
          .then(limitLength(3)),
      ]);

      const participants = ref(new Array(10).fill(0).map((_, i) => ({
        id: `participant-${ i }`,
        name: `Sudionik ${ i }`,
        description: `Opis sudionika ${ i }`,
        images: {
          default: {
            url: `https://placeimg.com/${ 1280 + i }/${ 720 + i }/arch`,
          },
          small: {
            url: `https://placeimg.com/${ 128 + i }/${ 72 + i }/arch`,
          },
        },
      })));

      const projectFriends = ref(new Array(10).fill(0).map((_, i) => ({
        id: `friend-${ i }`,
        link: "https://example.com",
        name: `Project friend ${ i }`,
        images: {
          srcSet: `https://placeimg.com/${ 1280 + i }/${ 720 + i }/arch/sepia`,
          lazySrc: `https://placeimg.com/${ 128 + i }/${ 72 + i }/arch/sepia`,
        },
      })));

      const mediaPartners = ref(new Array(10).fill(0).map((_, i) => ({
        id: `partner-${ i }`,
        link: "https://example.com",
        name: `Partner ${ i }`,
        images: {
          srcSet: `https://placeimg.com/${ 1280 + i }/${ 720 + i }/arch/grayscale`,
          lazySrc: `https://placeimg.com/${ 128 + i }/${ 72 + i }/arch/grayscale`,
        },
      })));

      const gallery = ref(new Array(6).fill(0).map((_, i) => ({
        url: `https://placeimg.com/${ 1280 + i }/${ 720 + i }/people`,
        thumb: `https://placeimg.com/${ 128 + i }/${ 72 + i }/people`,
      })));

      function getParticipantTitleText({
        name,
        description,
      }: {
        name: string,
        description: string,
      }) {
        const separator = "----------";

        return `${ name }\n${ separator }\n${ description }`;
      }

      return {
        isLoggedIn: computed(() => userStore.isLoggedIn),
        news,
        gallery,
        participants,
        projectFriends,
        mediaPartners,
        getParticipantTitleText,
        joinNowRoute,
        dotGet,
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

  .container {

    .secondary {
      color: $fer-black;

      &:hover {
        color: $fer-black;
      }
    }

    .heroContainer {
      $image-aspect-ratio: math.div(1, 2);

      font-size: 4rem;
      position: relative;
      display: flex;
      flex: 1 0 auto;
      min-height: 500px;

      .heroSizer {
        padding-bottom: #{$image-aspect-ratio * 100%};
      }

      .heroImage {
        $filter: color.adjust($fer-dark-blue, $alpha: -.4);

        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: $fer-dark-blue;

        // noinspection CssUnknownTarget
        background-image: linear-gradient(0deg, $filter, $filter), url("@/assets/images/page/index/bg.png");
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

        > * {
          line-height: 1.1em;
        }

        .heroContentSupertitle {
          font-size: .4em;
          font-weight: bold;
          margin: 0;
          text-transform: capitalize;
          color: $fer-yellow;
        }

        .heroContentTitle {
          font-size: 1em;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0;
          text-transform: capitalize;
          color: $fer-white;
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
      }
    }
  }
</style>
