<template>
  <app-max-width-container :not-found="!newsItem" :class="$style.container">
    <div :class="$style.newsContainer">
      <div
        :class="$style.image"
      >
        <app-img
          :alt="newsItem.title"
          :aspect-ratio="921/515"
          :src="newsItem.photo?.fullUrl"
          :lazy-src="newsItem.photo?.thumbUrl"
        />
      </div>

      <div
        :class="$style.contentContainer"
      >
        <small>
          <time
            :datetime="newsItem.date"
            :title="newsItem.date.toLocaleDateString()"
            v-text="newsItem.formattedDate"
          />
        </small>

        <h1 v-text="newsItem.title" />

        <h3 v-text="newsItem.description" />

        <main v-html="newsItem.content" />
      </div>
    </div>

    <p-divider :class="$style.spacer" />

    <h1>
      <translated-text trans-key="news.page.latestPosts" />
    </h1>

    <div :class="$style.lastNewsContainer" class="grid">
      <div
        v-for="item in last3News"
        :key="item.slug"
        class="col-12 md:col-4"
      >
        <news-card
          :news-item="item"
          no-box-shadow
        />
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import Divider from "primevue/divider";
  import {
    useRoute,
    useHeadMetadata,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    ensureArray,
  } from "~/helpers/data";
  import NewsCard from "~/components/news/news-card.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppImg from "~/components/util/app-img.vue";
  import {
    type INews,
  } from "~/graphql/schema";
  import {
    type NewsWithFormattedDate,
  } from "~/helpers/news";

  export default defineComponent({
    name: "NewsPage",

    components: {
      AppImg,
      TranslatedText,
      NewsCard,
      AppMaxWidthContainer,
      PDivider: Divider,
    },

    async setup() {
      const newsStore = useNewsStore();
      const $route = useRoute();

      const metaData = reactive({
        type: "article",
        image: "",
        description: "",
        "article:published_time": "",
      });
      const title = ref("");
      useHeadMetadata(metaData);
      useTitle(title, false);

      const {
        news,
        newsItem,
      } = await newsStore.fetchNewsItem(
        $route.params.slug as string,
        { take: 3 },
      );

      if (newsItem) {
        title.value = newsItem.title;

        metaData.image = newsItem.photo?.fullUrl ?? "";
        metaData.description = newsItem.description;
        metaData["article:published_time"] = new Date(String(newsItem.date)).toISOString();
      }

      return {
        newsItem: newsItem as NewsWithFormattedDate<INews>,
        last3News: ensureArray(news),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";
  @import "assets/styles/page/news";

  .container {

    .newsContainer {
      $item-gap: 1.625rem;

      display: flex;
      flex-direction: column;
      max-width: 921px;
      margin: 4.5rem auto 0;
      grid-template-columns: minmax(0, 1fr);
      gap: $item-gap;

      @include media(md) {
        margin-top: 0;
      }

      .image {
        @include media(md) {
          margin-inline: calc(-1 * #{$content-padding-mobile});
        }
      }

      .contentContainer {
        display: flex;
        flex-direction: column;
        max-width: 700px;
        gap: $item-gap;

        @include media(md) {
          gap: .5rem;
        }

        > small {
          font-size: .875em;
          opacity: .5;
          color: $fer-black;
        }

        > h1 {
          font-size: 2.5rem;
          font-weight: bold;
          margin: 0;
          color: $fer-dark-blue;

          @include media(md) {
            font-size: 1.625rem;
          }
        }

        > h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          max-width: 85%;
          margin: 0;
          opacity: .7;

          @include media(md) {
            font-size: 1.125rem;
            margin-top: 1rem;
            opacity: 1;
          }
        }

        > main {
          margin-top: calc(3.625rem - #{$item-gap});

          @extend %news-styles;
        }
      }
    }

    .spacer {
      margin-top: 6rem;
      margin-bottom: 4rem;

      &::before {
        border-top: 1px solid #{$fer-dark-blue};
      }
    }

    .lastNewsContainer {
      margin-bottom: 6rem;

      @include media(md) {
        margin-bottom: 2.5rem;
      }
    }
  }
</style>
