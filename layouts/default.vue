<template>
  <div
    :class="$style.page"
  >
    <app-header :class="$style.header" />
    <main
      :class="$style.main"
      role="main"
      v-bind="$attrs"
    >
      <slot />
    </main>
    <app-footer :show-logos="$route.name === 'index'" />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppFooter from "~/components/nav/AppFooter.vue";
  import AppHeader from "~/components/nav/AppHeader.vue";

  export default defineComponent({
    name: "LayoutDefault",

    components: {
      AppFooter,
      AppHeader,
    },

    inheritAttrs: false,
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main {
    display: flex;
    flex: 1;
  }

  .header + .main {
    margin-top: $nav-height;
  }
</style>
