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
  groupBy,
  map,
  mapKeys,
  pipe,
  reduce,
  replace,
  sortBy,
  toPairs,
} from "rambdax";
import express from "express";
import {
  apiRoute,
  rawRoute,
  RouteHandler,
} from "./request";
import {
  AuthConfig,
  requireAuthMiddleware,
} from "./auth";

type RequestMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

export class Router {
  private router: express.Router;

  constructor() {
    this.router = express.Router();
  }

  /// //////// REQUEST METHODS START ///////////
  all<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("all", path, handlers);
  }

  get<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("get", path, handlers);
  }

  getRaw<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRawRoute("get", path, handlers);
  }

  post<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("post", path, handlers);
  }

  postRaw<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRawRoute("post", path, handlers);
  }

  put<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("put", path, handlers);
  }

  delete<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("delete", path, handlers);
  }

  patch<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("patch", path, handlers);
  }

  options<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("options", path, handlers);
  }

  head<R>(path: string, ...handlers: RouteHandler<R>[]) {
    return this.addRoute("head", path, handlers);
  }

  /// //////// REQUEST METHODS END ///////////

  use<R>(...handlers: RouteHandler<R>[]) {
    const exposedHandlers =
      handlers
        .map((handler) => {
          if (handler instanceof Router) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            handler = handler.expose();
          }

          return handler;
        })
    ;

    this.router.use(...exposedHandlers);

    return this;
  }

  with<R>(...handlers: RouteHandler<R>[]) {
    return this.use(...handlers);
  }

  addRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandler<R>[]) {
    return this.addWrappedRoute(requestMethod, path, handlersList, apiRoute);
  }

  addRawRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandler<R>[]) {
    return this.addWrappedRoute(requestMethod, path, handlersList, rawRoute);
  }

  addWrappedRoute<T extends RequestMethod, R>(requestMethod: T, path: string, handlersList: RouteHandler<R>[], wrapper: ((handler: RouteHandler<R>) => RouteHandler<R>)) {
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

  constructor(authConfig: AuthConfig) {
    super();

    this.use(requireAuthMiddleware(authConfig));
  }

  bindToRouter(newRouter: Router | express.Router) {
    if (newRouter instanceof Router) {
      this.boundRouter = newRouter.expose();
    } else {
      this.boundRouter = newRouter;
    }

    return this;
  }

  static boundToRouter(router: Router | express.Router, authConfig: AuthConfig) {
    const self = new this(authConfig);

    return self.bindToRouter(router);
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

      router.use(path, handler);

      return router;
    };

  const createRouterFor = pipe(
    getListOfRoutesInFolder,
    groupBy(absoluteRoute),
    mapKeys(replace(/\[([^\]]+)]/gi, ":$1")),
    toPairs,
    sortBy<[ string, string[] ]>((x) => x[0]),
    reduce(assignPathToRouter, express.Router()),
  );

  return createRouterFor(folder);
};
