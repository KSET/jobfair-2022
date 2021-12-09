<template>
  <nuxt-link
    :class="$style.container"
    :to="{ name: 'news-slug', params: { slug: newsItem.slug } }"
  >
    <div
      :class="$style.card"
      class="p-card p-component"
    >
      <div class="p-card-header">
        <app-img
          :alt="newsItem.title"
          :src="newsItem.images.default.url"
          :lazy-src="newsItem.images.thumb.url"
          aspect-ratio="1.85"
        />
      </div>

      <div class="p-card-body">
        <div
          :class="$style.title"
          class="p-card-title"
          v-text="newsItem.title"
        />

        <div
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

    .title {
      font-size: 1.2rem;
      color: $fer-dark-blue;
    }

    .description {
      opacity: .7;
    }
  }
</style>
