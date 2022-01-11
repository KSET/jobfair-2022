import {
  IncomingMessage,
  ServerResponse,
} from "http";
import type {
  Promisable,
} from "type-fest";
import {
  getReasonPhrase,
  StatusCodes,
} from "http-status-codes";
import {
  map,
  pipe,
} from "rambda";
import {
  ServiceError,
} from "../services/errors/service-error";

export const response =
  <T>(
    {
      error,
      status,
      data,
    }: {
      error: boolean,
      status: StatusCodes,
      data: T,
    },
  ) => ({
    error,
    data,
    status,
    ts: Date.now(),
  })
;

export const success =
  <T>(data: T) =>
    response({
      error: false,
      status: StatusCodes.OK,
      data,
    })
;

export const error =
  <T>(
    {
      reason,
      status = StatusCodes.FORBIDDEN,
      data = null as unknown as T,
    }: {
      reason: string,
      status: StatusCodes,
      data: T,
    },
  ) =>
    ({
      ...response({
        error: true,
        status,
        data: null,
      }),
      statusInfo: getReasonPhrase(status),
      reason,
      errorData: data,
      _errorObject: undefined as unknown,
    })
;

export class ApiError<T> extends Error {
  constructor(
    message: string,
    public readonly statusCode = StatusCodes.IM_A_TEAPOT,
    public readonly data = null as unknown as T,
  ) {
    super(message);
  }

  static fromService<T>(e: ServiceError<T>) {
    return new this<T>(
      e.message,
      e.statusCode,
      e.data,
    );
  }

  static fromError<T>(e: Error) {
    if (e instanceof this) {
      return e;
    }

    return new this<T>(
      e?.message || "Something went wrong",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
}

export const asyncWrapper =
  <Handler extends ((...args: never[]) => unknown)>(fn: Handler) =>
    (...args: Parameters<Handler>) =>
      Promise
        .resolve(fn(...args) as Awaited<ReturnType<Handler>>)
        .catch()
;

export type RouteHandler<T> = (req: IncomingMessage, res: ServerResponse) => Promisable<T>;

export const routeWrapper =
  <T>(fn: RouteHandler<T>) =>
    asyncWrapper<RouteHandler<T>>(fn)
;

export const rawRoute =
  <T>(fn: RouteHandler<T>) =>
    routeWrapper(async (req, res) => {
      try {
        const result = await fn(req, res);

        if (result instanceof Buffer || "string" === typeof result) {
          return res.end(result);
        } else if (!res.writableEnded) {
          return res.end();
        }
      } catch (err) {
        const e =
          (err instanceof ServiceError)
            ? ApiError.fromService(err)
            : ApiError.fromError(err as Error)
        ;

        if (!(err instanceof ApiError)) {
          if ("development" === process.env.NODE_ENV) {
            // eslint-disable-next-line no-console
            console.log("|> ERROR", "\n", e);
          }
        }

        res.setHeader("X-Api-Error", e.message);
        res.statusCode = e.statusCode;
        return res.end();
      }
    })
;


export const apiRoute =
  <T>(handler: RouteHandler<T>) =>
    routeWrapper(async (req, res) => {
      const endRequest =
        <T>(payload: T) =>
          res
            .setHeader("Content-Type", "application/json")
            .end(JSON.stringify(payload))
      ;

      try {
        const result = await handler(req, res);

        if (res.writableEnded) {
          return;
        }

        if (result instanceof ServerResponse) {
          return result.end();
        }

        return endRequest(success(result));
      } catch (err) {
        const e =
          (err instanceof ServiceError)
            ? ApiError.fromService<unknown>(err)
            : ApiError.fromError<unknown>(err as Error)
        ;

        const errorData = error({
          status: e.statusCode,
          reason: e.message,
          data: e.data as unknown,
        });

        if (!(err instanceof ApiError)) {
          if ("development" === process.env.NODE_ENV) {
            // eslint-disable-next-line no-console
            console.log(err);

            if (err instanceof Object) {
              errorData._errorObject = {
                ...pipe(
                  Object.getOwnPropertyNames,
                  map((key) => [ key, (err as Record<string, never>)[key] ]),
                  Object.fromEntries,
                )(err),
                __errorConstructorName: err.constructor.name,
              };
            } else {
              errorData._errorObject = err;
            }
          }
        }

        res.statusCode = errorData.status;
        return endRequest(errorData);
      }
    })
;
