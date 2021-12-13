<template>
  <div
    :class="$style.page"
  >
    <app-header :class="$style.header" />
    <main
      :class="$style.main"
      v-bind="$attrs"
    >
      <slot />
    </main>
    <app-footer :show-logos="$route.name === 'index'" />
  </div>
</template>

<script>
  import AppFooter from "../components/nav/AppFooter";
  import AppHeader from "../components/nav/AppHeader";

  export default {
    name: "LayoutDefault",

    components: {
      AppFooter,
      AppHeader,
    },

    inheritAttrs: false,
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header + .main {
    margin-top: $nav-height;
  }
</style>
