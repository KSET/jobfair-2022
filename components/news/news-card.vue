<template>
  <nuxt-link
    :class="$style.container"
    :to="{ name: 'news-slug', params: { slug: newsItem.slug } }"
  >
    <div
      :class="$style.card"
      class="p-card p-component"
    >
      <div
        v-if="newsItem.images"
        class="p-card-header"
      >
        <app-img
          :alt="newsItem.title"
          :lazy-src="newsItem.images.thumb.url"
          :src="newsItem.images.default.url"
          aspect-ratio="1.85"
        />
      </div>

      <div class="p-card-body">
        <time
          :class="$style.date"
          :datetime="new Date(newsItem.date).toISOString()"
          v-text="newsItem.formattedDate"
        />

        <h2
          :class="$style.title"
          class="p-card-title"
          v-text="newsItem.title"
        />

        <p
          :class="$style.description"
          class="p-card-content"
          v-text="newsItem.description"
        />
      </div>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppImg from "~/components/util/app-img.vue";

  export default defineComponent({
    name: "NewsCard",
    components: { AppImg },
    props: {
      newsItem: {
        required: true,
        type: Object,
      },
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    display: flex;

    &:hover {

      .card {
        transition-duration: .2s;
        box-shadow: #{map-get($shadows, "shadow-4")};
      }
    }

    .card {
      overflow: hidden;
      transition-timing-function: $transition-timing-function;
      transition-duration: .4s;
      transition-property: box-shadow;
      box-shadow: #{map-get($shadows, "shadow-3")};
      will-change: box-shadow;
    }

    :global(.p-card-content) {
      padding-top: 0;
    }

    :global(.p-card-body) {
      padding: 0.75rem 1rem 1rem;
    }

    .date {
      font-size: 0.875rem;
      font-weight: normal;
      display: block;
      margin: 0 0 .5rem;
      opacity: .5;
      color: $fer-black;
    }

    .title {
      font-size: 1.25rem;
      font-weight: bold;
      line-height: 1.625rem;
      margin-bottom: .5rem;
      color: $fer-dark-blue;
    }

    .date + .title {
      margin-top: 0;
    }

    .description {
      line-height: 1.5rem;
      margin-bottom: .5rem;
      padding-bottom: 0;
      opacity: .7;
    }

    .title + .description {
      margin-top: 0;
    }
  }
</style>
