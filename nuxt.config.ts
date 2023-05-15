import "dotenv/config";

import Icons from "unplugin-icons/vite";
import ShortUniqueId from "short-unique-id";
import cssesc from "cssesc";
import StylelintPlugin from "@frsource/vite-plugin-stylelint";
import SvgLoader from "vite-svg-loader";
import {
  defineNuxtConfig,
} from "nuxt/config";

const ASSETS_PATH = "_assets";

const uid = new ShortUniqueId();

const identNameMap = new Map<string, string>();

const isProd = "production" === process.env.NODE_ENV;

const cssClassNameBlacklist = new Set([
  "pi",
  "fc",
]);

const CssNameValid = /[_a-zA-Z]+[_a-zA-Z\d-]*/g;

export default defineNuxtConfig({
  typescript: {
    strict: true,
  },

  buildModules: [
    "@nuxt/typescript-build",
  ],

  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "nuxt-icons",
    "@nuxtjs/plausible",
  ],

  build: {
    transpile: [
      "rambda",
      "rambdax",
      "primevue",
      "graphql",
    ],
  },

  css: [
    "@/node_modules/primeicons/primeicons.css",
    "@/node_modules/normalize.css/normalize.css",
    "@/node_modules/primeflex/primeflex.css",
    "@/node_modules/primevue/resources/primevue.css",
    "@/assets/styles/theme/primevue/theme.scss",
  ],

  app: {
    buildAssetsDir: `/${ ASSETS_PATH }/`,
    rootId: "__jobfair",
  },

  vite: {
    css: {
      modules: {
        generateScopedName(name: string, absoluteFilePath: string) {
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

    build: {
      rollupOptions: {
        output: {
          assetFileNames: `${ ASSETS_PATH }/[hash][extname]`,
          chunkFileNames: `${ ASSETS_PATH }/[hash].js`,
          entryFileNames: `${ ASSETS_PATH }/[hash].js`,
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      API_BASE: process.env.NUXT_PUBLIC_API_BASE || "/api",
      BASE_URL: process.env.NUXT_PUBLIC_BASE_URL || "",
      SENTRY_DSN: process.env.SENTRY_DSN,
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  telemetry: false,

  plausible: {
    autoOutboundTracking: true,
  },
});
