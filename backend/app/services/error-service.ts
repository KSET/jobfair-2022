import * as Sentry from "@sentry/node";
import {
  CaptureContext,
} from "@sentry/types";
import type {
  RequestHandler,
} from "express";
import {
  RequestHandlerOptions,
} from "@sentry/node/types/handlers";
import {
  isDev,
} from "./helpers/status";

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  return Sentry;
};

export const getSentryRequestHandler =
  (options?: RequestHandlerOptions) =>
    Sentry.Handlers.requestHandler({
      ip: true,
      ...options,
    }) as RequestHandler
;

export const captureError =
  <TError>(
    error: TError,
    context?: CaptureContext,
  ) => {
    if (isDev) {
      console.warn("Capturing error", error, context);
      return;
    }

    Sentry.captureException(error, context);
  }
;
