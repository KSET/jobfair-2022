import "dotenv/config";

import Icons from "unplugin-icons/vite";
import ShortUniqueId from "short-unique-id";
import cssesc from "cssesc";
import VitePluginChecker from "vite-plugin-checker";
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

const CssNameValid = /^[_a-zA-Z]+[_a-zA-Z\d-]*$/g;

export default defineNuxtConfig({
  typescript: {
    strict: true,
    shim: false,
  },

//   buildModules: [
//     "@nuxt/typescript-build",
//   ],

  modules: [
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "nuxt-icons",
    "@nuxtjs/plausible",
    "nuxt-primevue",
  ],

  build: {
    transpile: [
      "rambda",
      "rambdax",
      "graphql",
      "tslib",
    ],
  },

  css: [
    "@/assets/styles/theme/theme.scss",
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
              id = `jf_${ uid.sequentialUUID() }`;
            } while (cssClassNameBlacklist.has(id) || !CssNameValid.test(id));

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
      VitePluginChecker({
        typescript: true,
        stylelint: {
          lintCommand: 'stylelint "**/*.{scss,css,vue}" --ignore-path .gitignore',
        },
        eslint: {
          lintCommand: 'eslint --ext ".ts,.js,.vue" --ignore-path .gitignore --ignore-pattern "/backend/**/*"',
        },

        enableBuild: false,
      }),
    ],

    build: {
      rollupOptions: {
        output: {
          assetFileNames: `${ ASSETS_PATH }/[name]-[hash][extname]`,
          chunkFileNames: `${ ASSETS_PATH }/[name]-[hash].js`,
          entryFileNames: `${ ASSETS_PATH }/[name]-[hash].js`,
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

  primevue: {
    options: {
      ripple: true,
      inputStyle: "outlined",
    },
    components: {
      prefix: "P",
      include: [ "Button" ],
    },
  },

  devtools: {
    enabled: !isProd,
  },
});
