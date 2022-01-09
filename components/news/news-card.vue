<template>
  <nuxt-link
    :class="{
      [$style.container]: true,
      [$style.boxShadow]: !noBoxShadow,
      [$style.rounded]: !square,
    }"
    :to="{ name: 'news-slug', params: { slug: newsItem.slug } }"
  >
    <p-button
      class="flex border-noround text-left align-self-stretch p-0 p-button-secondary p-button-text"
    >
      <div
        :class="{
          [$style.card]: true,
          [$style.noBackground]: noBackground,
        }"
      >
        <app-img
          v-if="newsItem.images"
          :alt="newsItem.title"
          :lazy-src="newsItem.images.thumb.url"
          :src="newsItem.images.default.url"
          aspect-ratio="1.85"
        />

        <div :class="$style.body">
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
      </div>
    </p-button>
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

      noBoxShadow: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      noBackground: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      square: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include/all";

  .boxShadow {
    transition-property: box-shadow;
    box-shadow: #{map.get($shadows, "shadow-3")};
    will-change: box-shadow;

    &:hover {
      transition-duration: .2s;
      box-shadow: #{map.get($shadows, "shadow-4")};
    }
  }

  .container {
    display: flex;
    overflow: hidden;
    padding: 0;

    &.rounded {
      border-radius: 4px;
    }

    .card {
      overflow: hidden;
      height: 100%;
      box-shadow: none;

      &.noBackground {
        background: transparent;
      }
    }

    .body {
      padding: .75rem 1rem 1rem;
    }

    .date {
      font-size: .875rem;
      font-weight: normal;
      display: block;
      margin: 0 0 .5rem;
      opacity: .6;
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
      padding-top: 0;
      padding-bottom: 0;
      opacity: .7;
    }

    .title + .description {
      margin-top: 0;
    }
  }
</style>
