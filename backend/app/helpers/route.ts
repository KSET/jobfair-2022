import {
  basename,
  dirname,
  join as joinPath,
} from "path";
import {
  readdirSync,
  statSync,
} from "fs";
import {
  always,
  cond,
  groupBy,
  map,
  mapKeys,
  pipe,
  reduce,
  replace,
  sort,
  toPairs,
} from "rambdax";
import express, {
  RouterOptions,
} from "express";
import {
  NonEmptyArray,
} from "../types/helpers";
import {
  apiRoute,
  rawRoute,
  RouteHandler,
} from "./request";
import {
  AuthConfig,
  requireAuthMiddleware,
} from "./auth";

export type RequestMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";
export type RouteHandlers<T> = NonEmptyArray<RouteHandler<T>>;

export const DEFAULT_ROUTER_OPTIONS: RouterOptions = {
  mergeParams: true,
  caseSensitive: true,
  strict: false,
} as const;

export class Router {
  private router: express.Router;

  constructor(
    options: RouterOptions = DEFAULT_ROUTER_OPTIONS,
  ) {
    this.router = express.Router(options);
  }

  /// //////// REQUEST METHODS START ///////////
  all<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("all", path, handlers);
  }

  get<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("get", path, handlers);
  }

  getRaw<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRawRoute("get", path, handlers);
  }

  post<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("post", path, handlers);
  }

  postRaw<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRawRoute("post", path, handlers);
  }

  put<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("put", path, handlers);
  }

  delete<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("delete", path, handlers);
  }

  patch<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("patch", path, handlers);
  }

  options<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("options", path, handlers);
  }

  head<R>(path: string, ...handlers: RouteHandlers<R>) {
    return this.addRoute("head", path, handlers);
  }

  /// //////// REQUEST METHODS END ///////////

  use<R>(...handlers: RouteHandlers<R>) {
    const exposedHandlers =
      handlers
        .map((handler) => {
          if (handler instanceof Router) {
            // @ts-ignore
            handler = handler.expose();
          }

          return handler;
        })
    ;

    this.router.use(...exposedHandlers);

    return this;
  }

  with<R>(...handlers: RouteHandlers<R>) {
    return this.use(...handlers);
  }

  addRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandlers<R>) {
    return this.addWrappedRoute(requestMethod, path, handlersList, apiRoute);
  }

  addRawRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandlers<R>) {
    return this.addWrappedRoute(requestMethod, path, handlersList, rawRoute);
  }

  addWrappedRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandlers<R>, wrapper: ((handler: RouteHandler<R>) => RouteHandler<R>)) {
    const handler = handlersList.pop()!;

    this.router[requestMethod](path, ...[ ...handlersList, wrapper(handler) ]);

    return this;
  }

  expose() {
    return this.router;
  }

  _setRouter(router: express.Router) {
    this.router = router;

    return this;
  }
}

export class AuthRouter extends Router {
  private boundRouter: express.Router | null = null;

  constructor(authConfig?: AuthConfig, options?: RouterOptions) {
    super(options);

    this.use(requireAuthMiddleware(authConfig));
  }

  static boundToRouter(router: Router | express.Router, authConfig: AuthConfig) {
    const self = new this(authConfig);

    return self.bindToRouter(router);
  }

  bindToRouter(newRouter: Router | express.Router) {
    if (newRouter instanceof Router) {
      this.boundRouter = newRouter.expose();
    } else {
      this.boundRouter = newRouter;
    }

    return this;
  }

  expose() {
    if (null !== this.boundRouter) {
      this.boundRouter.use(super.expose());
      this._setRouter(this.boundRouter);
      this.boundRouter = null;
    }

    return super.expose();
  }
}

export const registerRoutesInFolderRecursive = (...folderParts: string[]) => {
  const folder = joinPath(...folderParts);

  const isDirectory = (path: string) => statSync(path).isDirectory();
  const isIndexFile = (path: string) => /(^|\/)index\.(js|ts)$/.test(path);
  const shouldSkip = (path: string) => !basename(path).startsWith("_");
  const routeBasePath = (path: string) => dirname(path).substring(folder.length) || "/";

  const pathToRoute = pipe(
    basename,
    replace(/\.[^.]*$/, ""),
    replace(/^index$/, ""),
  );
  const absoluteRoute = (path: string) => joinPath(routeBasePath(path), pathToRoute(path));

  const getListOfRoutesInFolder = (folder: string): string[] => {
    const withPath = (file: string) => joinPath(folder, file);

    const folderEntries = map(withPath, readdirSync(folder));
    const {
      true: folders = [],
      false: filesAll = [],
    } = groupBy(pipe(isDirectory, String), folderEntries);
    const {
      true: index = [],
      false: files = [],
    } = groupBy(pipe(isIndexFile, String), filesAll);

    const routeFiles = [
      ...index,
      ...files.filter(shouldSkip).sort(),
    ];

    return [
      ...routeFiles,
      ...folders.flatMap(getListOfRoutesInFolder),
    ];
  };

  const longestCommonPrefix = (a: string, b: string): string => {
    let i = 0;
    while (a[i] && a[i] === b[i]) {
      i += 1;
    }

    return a.substring(0, i);
  };

  const getHandler = (filePath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const router: Router | express.Router = require(filePath).default;

    if (router instanceof Router) {
      return router.expose();
    }

    return router;
  };

  const assignPathToRouter =
    (
      router: express.Router,
      [
        path,
        files,
      ]: [
        string,
        string[],
      ],
    ) => {
      if (1 < files.length) {
        throw new Error(`Duplicate routes: ${ files.join(" <~> ") }`);
      }

      const [ filePath ] = files;

      const handler = getHandler(filePath);

      if (handler) {
        router.use(path, handler);
      }

      return router;
    };

  const createRouterFor = pipe(
    getListOfRoutesInFolder,
    groupBy(absoluteRoute),
    mapKeys(replace(/\[([^\]]+)]/gi, ":$1")),
    toPairs,
    sort<[ string, string[] ]>(([ a ], [ b ]) => {
      const fix = cond<number[], number>([
        [ (x) => 0 > x, always(Infinity) ],
        [ always(true), (x) => x ],
      ]);

      const common = longestCommonPrefix(a, b).length - 1;
      const A = a.substring(common).indexOf(":");
      const B = b.substring(common).indexOf(":");

      if (A === B) {
        return a.localeCompare(b);
      }

      return fix(B) - fix(A);
    }),
    reduce(assignPathToRouter, express.Router(DEFAULT_ROUTER_OPTIONS)),
  );

  return createRouterFor(folder);
};
