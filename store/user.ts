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
        const resp = await useMutation<ILoginMutation, ILoginMutationVariables>(Login)(data);

        const info = resp?.data?.login ?? null;

        if (info?.user) {
          this.user = info.user;
        }

        return info;
      },

      async logout() {
        await useMutation<ILogoutMutation, ILogoutMutationVariables>(Logout)({});

        this.user = null;

        return true;
      },

      async register(data: IRegisterMutationVariables) {
        const resp = await useMutation<IRegisterMutation, IRegisterMutationVariables>(Register)(data);

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

        this.user = profile?.data?.profile ?? null;

        return this.user;
      },
    },
  },
);
