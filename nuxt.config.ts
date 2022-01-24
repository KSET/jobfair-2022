import Icons from "unplugin-icons/vite";
import ShortUniqueId from "short-unique-id";
import cssesc from "cssesc";
import {
  defineNuxtConfig,
} from "nuxt3";
import StylelintPlugin from "@frsource/vite-plugin-stylelint";
import SvgLoader from "vite-svg-loader";

const ASSETS_PATH = "/assets/";

const uid = new ShortUniqueId();

const identNameMap = new Map<string, string>();

const isProd = "production" === process.env.NODE_ENV;

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  nitro: {
    preset: "server",
  },

  buildModules: [
    "@vueuse/nuxt",
    "@nuxtjs/eslint-module",
    "@nuxtjs/stylelint-module",
    "@pinia/nuxt",
  ],

  build: {
    transpile: [
      "rambda",
      "rambdax",
      "primevue",
      "graphql",
    ],
    publicPath: ASSETS_PATH,
  },

  css: [
    "@/node_modules/@fontsource/raleway/latin.css",
    "@/node_modules/@fontsource/raleway/latin-ext.css",
    "@/node_modules/@fontsource/raleway/latin-400-italic.css",
    "@/node_modules/@fontsource/raleway/latin-ext-400-italic.css",
    "@/node_modules/@fontsource/raleway/latin-700-italic.css",
    "@/node_modules/@fontsource/raleway/latin-ext-700-italic.css",
    "@/node_modules/normalize.css/normalize.css",
    "@/node_modules/primeflex/primeflex.css",
    "@/node_modules/primevue/resources/primevue.css",
    "@/assets/styles/theme/primevue/theme.scss",
  ],

  app: {
    buildAssetsDir: ASSETS_PATH,
    baseURL: "/",
  },

  vite: {
    base: ASSETS_PATH,

    css: {
      modules: {
        generateScopedName(name, absoluteFilePath) {
          const relativeFilePath =
            absoluteFilePath
              .substring(__dirname.length + 1)
              .split("?")
              .shift() ?? "SOMETHING_WENT_WRONG_PARSE"
          ;

          const idScope = `${ absoluteFilePath }/${ name }`;
          if (!identNameMap.has(idScope)) {
            identNameMap.set(
              idScope,
              uid.sequentialUUID(),
            );
          }

          const className = identNameMap.get(idScope) ?? "SOMETHING_WENT_WRONG_CLASS";

          return cssesc(
            isProd
              ? className
              : `$${ relativeFilePath }::${ name }::${ className }`
            ,
            {
              isIdentifier: true,
            },
          );
        },
      },
    },

    plugins: [
      Icons({
        compiler: "vue3",
        defaultStyle: "",
        defaultClass: "",
      }),
      SvgLoader(),
      StylelintPlugin({
        fix: true,
      }),
    ],
  },

  publicRuntimeConfig: {
    API_BASE: process.env.API_URL,
  },
});
