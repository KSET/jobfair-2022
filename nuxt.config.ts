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

  build: {
    transpile: [
      "rambda",
    ],
  },

  css: [
    "@/node_modules/@fontsource/raleway/latin.css",
    "@/node_modules/@fontsource/raleway/latin-ext.css",
    "@/node_modules/@fontsource/raleway/latin-400-italic.css",
    "@/node_modules/@fontsource/raleway/latin-ext-400-italic.css",
    "@/node_modules/@fontsource/raleway/latin-700-italic.css",
    "@/node_modules/@fontsource/raleway/latin-ext-700-italic.css",
    "@/node_modules/normalize.css/normalize.css",
    "@/node_modules/primeicons/primeicons.css",
    "@/node_modules/primeflex/primeflex.css",
    "@/node_modules/primevue/resources/primevue.css",
    "@/assets/styles/theme/primevue/theme.scss",
  ],
});
