import {
  createClient,
  dedupExchange,
  ssrExchange,
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

const SSR_KEY = "__APP__URQL_DATA__";

export default defineNuxtPlugin((nuxt) => {
  const config = useRuntimeConfig();

  const ssr = ssrExchange({
    isClient: process.client,
  });

  // when app is created in browser, restore SSR state from nuxt payload
  if (process.client) {
    nuxt.hook("app:created", () => {
      ssr.restoreData(nuxt.payload[SSR_KEY] as never);
    });
  }

  // when app has rendered in server, send SSR state to client
  if (process.server) {
    nuxt.hook("app:rendered", () => {
      nuxt.payload[SSR_KEY] = ssr.extractData();
    });
  }

  const client = createClient({
    url: `${ config.public.API_BASE }/graphql`,
    exchanges: [
      dedupExchange,
      ssr,
      multipartFetchExchange as never,
    ],
    fetchOptions: () => {
      const config: RequestInit = {
        headers: {},
        credentials: "include",
        mode: "cors",
        redirect: "follow",
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
  });

  return {
    provide: {
      urql: client,
    },
  };
});
