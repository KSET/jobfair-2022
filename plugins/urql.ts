import {
  createClient,
  dedupExchange,
} from "@urql/core";
import {
  multipartFetchExchange,
} from "@urql/exchange-multipart-fetch";
import {
  unref,
} from "vue";
import {
  mergeDeepRight,
} from "rambdax";
import {
  defineNuxtPlugin,
  useCookie,
  useRuntimeConfig,
} from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  return {
    provide: {
      urql: createClient({
        url: `${ config.API_BASE as string }/graphql`,
        exchanges: [
          dedupExchange,
          multipartFetchExchange,
        ],
        fetchOptions: () => {
          let config: RequestInit = {};

          // Session ID header for server
          {
            const sessionId = unref(useCookie("jobfair-session"));

            if (sessionId) {
              config = mergeDeepRight(config, {
                headers: {
                  "x-session-id": sessionId,
                },
              });
            }
          }

          return config;
        },
      }),
    },
  };
});
