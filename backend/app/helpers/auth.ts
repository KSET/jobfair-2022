import {
  StatusCodes,
} from "http-status-codes";
import {
  error,
  RouteHandler,
} from "./request";

export type AuthConfig = {
  role?: string,
};

export const requireAuthMiddleware =
  <T>(config: AuthConfig): RouteHandler<T> =>
    (req, res, next) => {
      if (!req.user) {
        res.status(StatusCodes.UNAUTHORIZED);

        return res.json(error({
          reason: "authorization-required",
          status: StatusCodes.UNAUTHORIZED,
          data: {
            required: "auth",
            given: "none",
          },
        }));
      }

      console.log(config);

      return next();
    }
;
