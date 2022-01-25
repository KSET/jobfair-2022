<template>
  <app-img
    :src="profileImage"
    alt="Avatar"
    aspect-ratio="1"
    contain
  />
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import {
    useRuntimeConfig,
  } from "#app";
  import AppImg from "~/components/util/app-img.vue";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    components: { AppImg },
    setup() {
      const config: Record<string, string> = useRuntimeConfig();
      const userStore = useUserStore();

      return {
        profileImage: computed(() => `${ config.API_BASE }/placeholder/${ userStore.user?.uid ?? "profile" }/avatar.svg`),
      };
    },
  });
</script>
