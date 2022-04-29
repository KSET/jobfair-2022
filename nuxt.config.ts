import "dotenv/config";

import Icons from "unplugin-icons/vite";
import ShortUniqueId from "short-unique-id";
import cssesc from "cssesc";
import {
  defineNuxtConfig,
} from "nuxt";
import StylelintPlugin from "@frsource/vite-plugin-stylelint";
import SvgLoader from "vite-svg-loader";

const ASSETS_PATH = "/assets/";

const uid = new ShortUniqueId();

const identNameMap = new Map<string, string>();

const isProd = "production" === process.env.NODE_ENV;

const cssClassNameBlacklist = new Set([
  "pi",
  "fc",
]);

const CssNameValid = /[_a-zA-Z]+[_a-zA-Z\d-]*/g;

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  features: {
    transitions: false,
    store: false,
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
    "@/node_modules/primeicons/primeicons.css",
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
            let id;
            do {
              id = uid.sequentialUUID();
            } while (cssClassNameBlacklist.has(id) || id.startsWith("p-") || !CssNameValid.test(id));

            identNameMap.set(
              idScope,
              id,
            );
          }

          const className = identNameMap.get(idScope) ?? "SOMETHING_WENT_WRONG_CLASS";

          return cssesc(
            isProd
              ? className
              : `${ className }$${ relativeFilePath }::${ name }`
            ,
            {
              isIdentifier: true,
            },
          );
        },
      },
    },

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
    SENTRY_DSN: process.env.SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
  },
});
