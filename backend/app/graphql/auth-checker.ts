import {
  AuthChecker,
} from "type-graphql";
import {
  Context,
} from "../types/apollo-context";
import {
  hasAtLeastRole,
  Role,
} from "../helpers/auth";

export const authChecker: AuthChecker<Context> = (
  {
    context,
  },
  roles,
) => {
  const {
    user,
  } = context;

  if (0 === roles.length) {
    return Boolean(user);
  }

  return roles.some((role) => hasAtLeastRole(role as Role, user));
};
