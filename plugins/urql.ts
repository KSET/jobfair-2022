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
  defineNuxtPlugin,
  useCookie,
  useRuntimeConfig,
} from "#app";
import {
  Dict,
} from "~/helpers/type";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  return {
    provide: {
      urql: createClient({
        url: `${ config.API_BASE as unknown as string }/graphql`,
        exchanges: [
          dedupExchange,
          multipartFetchExchange,
        ],
        fetchOptions: () => {
          const config: RequestInit = {
            headers: {},
          };

          // Session ID header for server
          {
            const sessionId = unref(useCookie("jobfair-session"));

            if (sessionId) {
              (config.headers as Dict<string>)["X-Session-Id"] = sessionId;
            }
          }

          return config;
        },
      }),
    },
  };
});
