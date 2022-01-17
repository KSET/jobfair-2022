import {
  createClient,
  dedupExchange,
  fetchExchange,
} from "@urql/core";
import {
  defineNuxtPlugin,
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
          fetchExchange,
        ],
      }),
    },
  };
});
