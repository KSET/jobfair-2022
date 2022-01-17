import {
  StatusCodes,
} from "http-status-codes";
import {
  error,
  RouteHandler,
} from "./request";

export enum Role {
  Student = "student",
  Company = "company",
  AccountManager = "account-manager",
  PR = "pr",
  Admin = "admin",
}

export type AuthConfig = {
  role?: Role,
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
