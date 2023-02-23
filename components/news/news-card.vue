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
      class="flex border-noround text-left align-self-stretch p-0 p-button-secondary p-button-text w-full"
      tabindex="-1"
    >
      <div
        :class="{
          [$style.card]: true,
          [$style.noBackground]: noBackground,
        }"
      >
        <app-img
          v-if="newsItem.photo"
          :alt="newsItem.title"
          :lazy-src="newsItem.photo.thumbUrl"
          :src="newsItem.photo.fullUrl"
          aspect-ratio="1.85"
        />

        <div :class="$style.body">
          <time
            :class="$style.date"
            :datetime="date.toISOString()"
            v-text="formattedDate"
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
  import type {
    PropType,
  } from "vue";
  import {
    defineComponent,
  } from "vue";
  import AppImg from "~/components/util/app-img.vue";
  import {
    INews,
  } from "~/graphql/schema";
  import {
    computed,
    ref,
  } from "#imports";
  import {
    formatDate,
  } from "~/helpers/date";

  export default defineComponent({
    name: "NewsCard",

    components: {
      AppImg,
    },

    props: {
      newsItem: {
        required: true,
        type: Object as PropType<INews>,
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

    setup(props) {
      const date = ref(new Date(props.newsItem.date as string));
      const formattedDate = computed(() => formatDate(date.value));

      return {
        date,
        formattedDate,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include/all";

  .boxShadow {
    transition-duration: .4s;
    transition-property: box-shadow;
    box-shadow: #{map.get($shadows, "shadow-3")};
    will-change: box-shadow;

    &:hover {
      transition-duration: 0s;
      box-shadow: #{map.get($shadows, "shadow-4")};
    }
  }

  .container {
    display: flex;
    overflow: hidden;
    flex: 1;
    padding: 0;

    &.rounded {
      border-radius: 4px;
    }

    .card {
      overflow: hidden;
      width: 100%;
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
