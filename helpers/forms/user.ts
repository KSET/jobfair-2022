import {
  capitalize,
} from "lodash-es";
import {
  toPairs,
} from "rambdax";
import {
  IUser,
} from "~/graphql/schema";
import {
  InputEntry,
} from "~/components/util/form/app-formgroup.vue";
import {
  Language,
  LanguageISO,
  LanguageToName,
} from "~/store/translations";

const withRandomName =
  <T>(
    fn: ({
      name,
    }: {
      name: string,
    }) => T,
  ): T =>
    fn({
      name: 0.5 >= Math.random() ? "Marko" : "Ana",
    })
;

type Profile = Omit<IUser,
  "uid"
  | "companies"
  | "createdAt"
  | "updatedAt"
  | "name"
  | "roles"
  | "resume"
  | "_count">;
export const userProfileEdit =
  <T extends Profile>(user?: T | null): Record<keyof Profile, InputEntry> =>
    withRandomName(({
      name,
    }) => ({
      firstName: {
        value: user?.firstName || "",
        type: "text",
        placeholder: name,
      },
      lastName: {
        value: user?.lastName || "",
        type: "text",
        placeholder: "Horvat",
      },
      email: {
        value: user?.email || "",
        type: "email",
        placeholder: `${ name }.horvat@example.com`.toLocaleLowerCase(),
      },
      phone: {
        value: user?.phone || "",
        type: "tel",
        placeholder: "+385981234567",
      },
      language: {
        value: user?.language || LanguageISO[Language.HR],
        type: "dropdown",
        options: toPairs(LanguageISO).map(([ label, value ]) => ({
          label: LanguageToName[label],
          value,
        })),
      },
    }))
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
          required: false,
          placeholder: "••••••••",
          attrs: {
            minlength: 8,
          },
        },
        passwordRepeat: {
          value: "",
          type: "password",
          required: false,
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
          value: user?.roles.map((role) => role.name) || [],
          type: "dropdown",
          options: roles.map((role) => ({ label: capitalize(role.name), value: role.name })),
        },
      })
;
