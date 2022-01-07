<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="news.header" />
    </h1>

    <app-img
      :alt="newsItem.title"
      :lazy-src="newsItem.images.thumb.url"
      :src="newsItem.images.default.url"
      aspect-ratio="1.78"
      class="hidden md:flex"
    >
      <nuxt-link
        :to="{ name: 'news-slug', params: { slug: newsItem.slug } }"
      >
        <div :class="$style.heroNews">
          <time
            :class="$style.date"
            :datetime="new Date(newsItem.date).toISOString()"
            v-text="newsItem.formattedDate"
          />

          <h2
            :class="$style.title"
            v-text="newsItem.title"
          />

          <p
            :class="$style.description"
            v-text="newsItem.description"
          />
        </div>
      </nuxt-link>
    </app-img>

    <div :class="$style.newsContainer" class="grid">
      <div
        v-for="item in news"
        :key="item.slug"
        class="col-12 sm:col-6 lg:col-4 flex"
      >
        <news-card
          :news-item="item"
          no-box-shadow
        />
      </div>
    </div>

    <!--    <p-carousel
          :autoplay-interval="5000"
          :circular="true"
          :class="$style.carousel"
          :indicators-content-class="$style.carouselIndicators"
          :num-scroll="1"
          :num-visible="1"
          :value="news.slice(0, 3)"
          :page="0"
        >
          <template #item="{ data }">
            APP IMG OVJDE
          </template>
        </p-carousel>-->
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppImg from "~/components/util/app-img.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    ensureArray,
  } from "~/helpers/data";
  import NewsCard from "~/components/news/news-card.vue";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageBlog",

    components: {
      NewsCard,
      AppImg,
      AppMaxWidthContainer,
    },

    async setup() {
      useTitle("news.header");
      const newsStore = useNewsStore();

      const [
        news,
      ] = await Promise.all([
        newsStore
          .fetchNews()
          .then(ensureArray),
      ]);

      const newsItem = computed(() => news[0]);

      return {
        news,
        newsItem,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:math";
  @import "assets/styles/include/all";

  $breakpoint: md;

  .heroNews {
    max-width: 365px;

    .date {
      font-size: .875rem;
      font-weight: normal;
      margin: 0;
      opacity: .5;
      color: $fer-black;
    }

    .title {
      font-size: 1.4rem;
      font-weight: bold;
      line-height: 2rem;
      margin: 0 0 .5rem;
      color: $fer-dark-blue;
    }

    .description {
      font-size: 1rem;
      line-height: 1.625rem;
      margin: 0;
      opacity: .7;
      color: $fer-black;
    }
  }

  .carousel {

    :global(.p-carousel-container) > button {
      display: none;
    }

    .carouselIndicators {
      z-index: 2;
      padding: 0;
      transform: translateY(calc(-100% - .875rem));

      :global(.p-carousel-indicator) {
        margin-right: .5rem;
        margin-bottom: 0;

        &:last-child {
          margin-right: 0;
        }

        > button {
          width: .625rem;
          height: .625rem;
          border-radius: 50%;
          background-color: rgba($fer-white, .6);

          &:hover {
            background: $fer-white;
          }
        }

        &:global(.p-highlight) {

          > button {
            background: rgba($fer-yellow, .6);

            &:hover {
              background: $fer-yellow;
            }
          }
        }
      }
    }
  }

  .newsContainer {
    margin-top: 4rem;
  }
</style>
