import {
  defineNuxtConfig,
} from "nuxt3";

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  buildModules: [
    "@vueuse/core/nuxt",
    "@nuxtjs/eslint-module",
    "@nuxtjs/stylelint-module",
    "@pinia/nuxt",
    "@vueuse/core/nuxt",
  ],

  css: [
    "@/assets/styles/theme/primevue/theme.scss",
  ],
});
