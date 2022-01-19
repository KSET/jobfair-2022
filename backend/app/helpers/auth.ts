import {
  StatusCodes,
} from "http-status-codes";
import {
  SessionUser,
} from "../types/apollo-context";
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

const roleToPriority: Record<Role, number> = {
  [Role.Student]: 0,
  [Role.Company]: 0,
  [Role.AccountManager]: 5,
  [Role.PR]: 5,
  [Role.Admin]: Infinity,
};

export const hasAtLeastRole =
  (
    minimumRoleName: Role,
    user: SessionUser,
  ): boolean =>
    user.roles.some((role) => roleToPriority[minimumRoleName] <= roleToPriority[role])
;

export const requireAuthMiddleware =
  <T>(config: AuthConfig = {}): RouteHandler<T> =>
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

      if (config.role && !hasAtLeastRole(config.role, req.user)) {
        res.status(StatusCodes.UNAUTHORIZED);

        return res.json(error({
          reason: "authorization-required",
          status: StatusCodes.UNAUTHORIZED,
          data: {
            required: `role:${ config.role }`,
            given: req.user.roles,
          },
        }));
      }

      return next();
    }
;
