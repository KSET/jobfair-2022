<template>
  <app-max-width-container :class="$style.container">
    <pre v-text="newsItem" />

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
  } from "vue";
  import {
    useRoute,
  } from "vue-router";
  import Divider from "primevue/divider";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    ensureArray,
    limitLength,
  } from "~/helpers/data";
  import NewsCard from "~/components/news/news-card.vue";

  export default defineComponent({
    name: "NewsPage",

    components: {
      NewsCard,
      AppMaxWidthContainer,
      PDivider: Divider,
    },

    async setup() {
      const newsStore = useNewsStore();
      const $route = useRoute();

      const [
        newsItem,
        last3News,
      ] = await Promise.all([
        newsStore.fetchNewsItem($route.params.slug as string),
        newsStore.fetchNews().then(ensureArray).then(limitLength(3)),
      ]);

      return {
        newsItem,
        last3News,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

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