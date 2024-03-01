import {
  capitalize,
} from "lodash-es";
import {
  toPairs,
} from "rambdax";
import {
  type IUser,
} from "~/graphql/schema";
import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
import {
  Language,
  LanguageISO,
  LanguageToName,
} from "~/store/translations";

type Profile = Omit<IUser,
  "uid"
  | "companies"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "roles"
  | "resume"
  | "eventLog"
  | "_count">;
export const userProfileEdit =
  <T extends Profile>(user?: T | null): Record<keyof Profile, InputEntry> =>
    ({
      firstName: {
        value: user?.firstName || "",
        type: "text",
        placeholder: "Matija",
      },
      lastName: {
        value: user?.lastName || "",
        type: "text",
        placeholder: "Horvat",
      },
      email: {
        value: user?.email || "",
        type: "email",
        placeholder: "matija.horvat@example.com",
      },
      phone: {
        value: user?.phone || "",
        type: "tel",
        placeholder: "+385987654321",
      },
      language: {
        value: user?.language || LanguageISO[Language.HR],
        type: "dropdown",
        options: toPairs(LanguageISO).map(([ label, value ]) => ({
          label: LanguageToName[label],
          value,
        })),
      },
    })
;


type UserRegister = Profile & {
  password: string,
  passwordRepeat: string,
};
export const userRegister =
  <T extends UserRegister>(user?: T | null) =>
    (): Record<keyof UserRegister, InputEntry> =>
      ({
        ...userProfileEdit(user),
        password: {
          value: "",
          type: "password",
          placeholder: "••••••••",
          attrs: {
            minlength: 8,
          },
        },
        passwordRepeat: {
          value: "",
          type: "password",
          placeholder: "••••••••",
          attrs: {
            minlength: 8,
          },
        },
      })
;

type User = Profile & {
  password: string,
  roles: IUser["roles"],
};
export const userEdit =
  <T extends User>(user?: T | null) =>
    (roles: IUser["roles"]): Record<keyof User, InputEntry> =>
      ({
        ...userProfileEdit(user),
        password: {
          value: "",
          type: "password",
          required: false,
        },
        roles: {
          value: user?.roles?.map((role) => role.name) || [],
          type: "dropdown",
          options: roles.map((role) => ({ label: capitalize(role.name), value: role.name })),
        },
      })
;
