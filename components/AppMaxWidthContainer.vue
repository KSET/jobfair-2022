<template>
  <div :class="$style.pageContainer">
    <slot v-bind="$attrs" />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";

  export default defineComponent({
    inheritAttrs: false,
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .pageContainer {
    max-width: $content-max-width;
    margin: 0 auto 2rem;
    padding: 0;
    transition-timing-function: $transition-timing-function;
    transition-duration: .3s;
    transition-property: padding;

    @media screen and (max-width: #{$content-max-width + 2 * $font-size}) {
      padding: 0 2rem;
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
    }
  }
</style>
