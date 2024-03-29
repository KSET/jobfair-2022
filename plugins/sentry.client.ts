import * as Sentry from "@sentry/vue";
import {
  type Primitive,
} from "type-fest";
import {
  defineNuxtPlugin,
  useRuntimeConfig,
} from "#app";

export default defineNuxtPlugin((nuxt) => {
  const config = useRuntimeConfig();
  const { vueApp } = nuxt;

  Sentry.init({
    app: [
      vueApp,
    ],
    dsn: config.public.SENTRY_DSN,
    logErrors: false,
    debug: "development" === config.public.NODE_ENV,
    environment: config.public.NODE_ENV,
  });

  Sentry.attachErrorHandler(vueApp, {
    logErrors: false,
    attachProps: true,
    trackComponents: true,
    timeout: 2000,
    hooks: [
      "activate",
      "mount",
      "update",
    ],
  });

  return {
    provide: {
      sentrySetContext: (name: string, context: Record<string, unknown>) => Sentry.setContext(name, context),
      sentrySetUser: (user: Sentry.User) => Sentry.setUser(user),
      sentrySetTag: (tagName: string, value: Primitive) => Sentry.setTag(tagName, value),
      sentryAddBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
    },
  };
});
