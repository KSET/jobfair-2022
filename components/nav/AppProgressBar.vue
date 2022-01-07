<template>
  <transition name="top-progress-transition">
    <p-progress-bar
      v-if="isLoading"
      :class="$style.progress"
      mode="indeterminate"
    />
  </transition>
</template>

<script lang="ts">
  import {
    defineComponent,
    nextTick,
    ref,
  } from "vue";
  import ProgressBar from "primevue/progressbar";
  import {
    useThrottle,
  } from "@vueuse/core";
  import {
    useNuxtApp,
  } from "#app";

  export default defineComponent({
    components: {
      PProgressBar: ProgressBar,
    },

    setup() {
      const nuxt = useNuxtApp();
      const isLoading = ref(false);

      nuxt.hook("page:start", () => {
        isLoading.value = true;
      });

      nuxt.hook("page:finish", () => {
        nextTick(() => {
          isLoading.value = false;
        });
      });

      return {
        isLoading: useThrottle(isLoading, 300),
      };
    },
  });
</script>

<style lang="scss">
  .top-progress-transition {

    &-enter-active,
    &-leave-active {
      transform: translateY(0);
      opacity: 1;
    }

    &-leave-active {
      transition-duration: .3s;
    }

    &-enter-from,
    &-leave-to {
      transform: translateY(-.5rem);
      opacity: 0;
    }
  }
</style>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .progress {
    position: fixed !important;
    z-index: 999;
    top: 0;
    right: 0;
    left: 0;
    height: .5rem;
    transition-timing-function: $transition-timing-function;
    transition-property: transform, opacity;
  }
</style>
