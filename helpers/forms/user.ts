import {
 capitalize,
} from "lodash-es";
import {
  IUser,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";

type Profile = Omit<IUser,
  "uid"
  | "companies"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "roles"
  | "_count">;
export const userProfileEdit =
  <T extends Profile>(user?: T | null): Record<keyof Profile, InputEntry> =>
    ({
      firstName: {
        value: user?.firstName || "",
        type: "text",
      },
      lastName: {
        value: user?.lastName || "",
        type: "text",
      },
      email: {
        value: user?.email || "",
        type: "email",
      },
      phone: {
        value: user?.phone || "",
        type: "tel",
      },
    })
;

type User = Profile & {
  roles: IUser["roles"],
};
export const userEdit =
  <T extends User>(user?: T | null) =>
    (roles: IUser["roles"]): Record<keyof User, InputEntry> =>
      ({
        ...userProfileEdit(user),
        roles: {
          value: user?.roles.map((role) => role.name) || [],
          type: "dropdown",
          options: roles.map((role) => ({ label: capitalize(role.name), value: role.name })),
        },
      })
;
