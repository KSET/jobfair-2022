<template>
  <app-max-width-container :not-found="!newsItem" :class="$style.container">
    <div :class="$style.newsContainer">
      <div
        :class="$style.image"
      >
        <app-img
          :alt="newsItem.title"
          :aspect-ratio="921/515"
          :src="newsItem.image"
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
    computed,
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import Divider from "primevue/divider";
  import {
    useRoute,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    ensureArray,
  } from "~/helpers/data";
  import NewsCard from "~/components/news/news-card.vue";
  import {
    useHead,
  } from "#app";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppImg from "~/components/util/app-img.vue";
  import {
    INews,
  } from "~/graphql/schema";
  import {
    NewsWithFormattedDate,
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
        image: "",
        description: "",
      });
      const title = ref("");
      useHead({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        meta: computed(() => generateMetadata({
          image: metaData.image,
          description: metaData.description,
        })),
      });
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

        metaData.image = newsItem.image;
        metaData.description = newsItem.description;
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

          * {
            line-height: 1.5;
            color: #{color.adjust($fer-black, $alpha: -.2)};
          }

          p {
            margin-block: 1rem;

            @include media(md) {
              margin-block: .5rem;
            }
          }

          h1,
          h2,
          h3,
          h4,
          h5 {
            $this: &;

            font-size: 1rem;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 1rem;
            color: $fer-dark-blue;

            @include media(md) {
              margin-bottom: .5rem;
            }

            & + p {
              margin-top: 0;
            }
          }

          h1 {
            font-size: 1.25rem;
          }

          p + h1,
          p + h2 {
            margin-top: 3.5rem;

            @include media(md) {
              margin-top: 2.5rem;
            }
          }

          a {
            text-decoration: none;
            color: #{color.adjust($fer-dark-blue, $alpha: -.2)};

            &:hover {
              text-decoration: underline;
            }
          }
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
