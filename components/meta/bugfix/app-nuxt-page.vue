<template>
  <RouterView v-slot="{ Component }">
    <template v-if="Component">
      <Suspense
        @resolve="handleResolve(Component)"
        @pending="handlePending(Component)"
      >
        <component
          :is="Component"
          :key="key"
        />

        <template #fallback>
          Loading...
        </template>
      </Suspense>
    </template>
  </RouterView>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import {
    // eslint-disable-next-line import/named
    RouteLocationNormalizedLoaded,
    useRoute,
  } from "vue-router";
  import {
    useNuxtApp,
  } from "#app";
  import {
    RuntimeNuxtHooks,
  } from "#app/nuxt";

  const generateRouteKey =
    (
      route: RouteLocationNormalizedLoaded,
      override: string | ((route: RouteLocationNormalizedLoaded) => string),
    ) => {
      const source =
        override
        ?? route.meta.key
        ?? route.fullPath
      ;

      return (
        "function" === typeof source
          ? source(route)
          : source
      );
    }
  ;

  export default defineComponent({
    name: "NuxtPageNoTransition",

    props: {
      pageKey: {
        type: [ Function, String ] as unknown as () => string | ((route: RouteLocationNormalizedLoaded) => string),
        default: null,
      },
    },

    setup(props) {
      const nuxtApp = useNuxtApp();
      const route = useRoute();

      return {
        key: computed(() => generateRouteKey(route, props.pageKey)),
        handlePending(...args: Parameters<RuntimeNuxtHooks["page:start"]>) {
          void nuxtApp.callHook("page:start", ...args);
        },
        handleResolve(...args: Parameters<RuntimeNuxtHooks["page:finish"]>) {
          void nuxtApp.callHook("page:finish", ...args);
        },
      };
    },
  });
</script>
