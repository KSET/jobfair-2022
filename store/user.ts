import {
  defineStore,
} from "pinia";
import {
  ILoginMutation,
  ILoginMutationVariables,
  ILogoutMutation,
  ILogoutMutationVariables,
  IProfileQuery,
  IProfileQueryVariables,
  IRegisterMutation,
  IRegisterMutationVariables,
  Login,
  Logout,
  Profile,
  Register,
} from "~/graphql/schema";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";

type User = IProfileQuery["profile"];

export const useUserStore = defineStore(
  "user",
  {
    state: () => ({
      user: null as (null | User),
    }),

    getters: {
      isLoggedIn(state) {
        return Boolean(state.user);
      },
    },

    actions: {
      async login(data: ILoginMutationVariables) {
        const doLogin = useMutation<ILoginMutation, ILoginMutationVariables>(Login);

        // noinspection TypeScriptValidateJSTypes
        const resp =
          await doLogin(data)
            .catch((_reason) => null)
        ;

        const info = resp?.data?.login ?? null;

        if (info?.user) {
          this.user = info.user;
        }

        return info;
      },

      async logout() {
        try {
          await useMutation<ILogoutMutation, ILogoutMutationVariables>(Logout)({});
        } catch {
        }

        this.user = null;

        return true;
      },

      async register(data: IRegisterMutationVariables) {
        const doRegister = useMutation<IRegisterMutation, IRegisterMutationVariables>(Register);

        // noinspection TypeScriptValidateJSTypes
        const resp =
          await doRegister(data)
            .catch((_reason) => null)
        ;

        const info = resp?.data?.register ?? null;

        if (info?.user) {
          this.user = info.user;
        }

        return info;
      },

      async fetchProfile() {
        const profile = await useQuery<IProfileQuery, IProfileQueryVariables>({
          query: Profile,
        })();

        this.user = profile.data?.profile ?? null;

        return this.user;
      },
    },
  },
);
