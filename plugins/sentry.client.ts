import * as Sentry from "@sentry/vue";
import {
  Primitive,
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

  type User = {
    [key: string]: unknown,
    id?: string,
    ip_address?: string,
    email?: string,
    username?: string,
  };

  enum Severity {
    Fatal = "fatal",
    Error = "error",
    Warning = "warning",
    Log = "log",
    Info = "info",
    Debug = "debug",
    Critical = "critical"
  }

  type Breadcrumb = {
    type?: string,
    level?: Severity,
    event_id?: string,
    category?: string,
    message?: string,
    data?: {
      [key: string]: unknown,
    },
    timestamp?: number,
  };

  return {
    provide: {
      sentrySetContext: (name: string, context: Record<string, unknown>) => Sentry.setContext(name, context),
      sentrySetUser: (user: User) => Sentry.setUser(user),
      sentrySetTag: (tagName: string, value: Primitive) => Sentry.setTag(tagName, value),
      sentryAddBreadcrumb: (breadcrumb: Breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
    },
  };
});
