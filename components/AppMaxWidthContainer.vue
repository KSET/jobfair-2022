<template>
  <div :class="$style.pageContainer">
    <slot v-if="!notFound" />
    <page-not-found v-else />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import PageNotFound from "~/components/page-not-found.vue";

  export default defineComponent({
    components: {
      PageNotFound,
    },

    props: {
      notFound: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .pageContainer {
    flex: 1;
    max-width: $content-max-width;
    margin: 0 auto #{$content-padding};
    padding: 0;
    transition-property: padding;

    @media screen and (max-width: #{$content-max-width + $content-padding * 2}) {
      padding: 0 #{$content-padding-mobile};
    }

    @include media(md) {
      max-width: $content-max-width-mobile;
    }

    > h1 {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.875rem;
      margin: 4rem 0;
      text-align: center;
      color: $fer-dark-blue;

      @include media(md) {
        font-size: 1.625rem;
        margin: 2.25rem 0;
      }
    }
  }
</style>
