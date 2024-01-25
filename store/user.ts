import {
  defineStore,
} from "pinia";
import {
  type ILoginMutation,
  type ILoginMutationVariables,
  type ILogoutMutation,
  type ILogoutMutationVariables,
  type IRequestPasswordResetMutation,
  type IRequestPasswordResetMutationVariables,
  type IProfileQuery,
  type IProfileQueryVariables,
  type IRegisterMutation,
  type IRegisterMutationVariables,
  type IUpdatePasswordMutation,
  type IUpdatePasswordMutationVariables,
  type IUpdateProfileMutation,
  type IUpdateProfileMutationVariables,
  Login,
  RequestPasswordReset,
  Logout,
  Profile,
  Register,
  UpdatePassword,
  UpdateProfile,
} from "~/graphql/schema";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";

type User = NonNullable<IProfileQuery["profile"]>;
type Company = NonNullable<User["companies"][0]>;

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

      isAdmin(state) {
        return state.user?.roles.some(({ name }) => "admin" === name) ?? false;
      },

      isScanner(state) {
        return state.user?.roles.some(({ name }) => "scanner" === name) ?? false;
      },

      company(state): Company | null {
        return state.user?.companies?.[0] || null;
      },

      hasCompany(): boolean {
        return Boolean(this.company);
      },
    },

    actions: {
      async login(data: ILoginMutationVariables) {
        const resp = await useMutation<ILoginMutation, ILoginMutationVariables>(Login)(data);

        const info = resp?.data?.login ?? null;

        if (info?.entity) {
          this.user = info.entity;
        }

        return info;
      },

      async requestResetPassword(data: IRequestPasswordResetMutationVariables) {
        const resp = await useMutation<IRequestPasswordResetMutation, IRequestPasswordResetMutationVariables>(RequestPasswordReset)(data);

        return resp?.data?.requestPasswordReset ?? false;
      },

      async logout() {
        await useMutation<ILogoutMutation, ILogoutMutationVariables>(Logout)({});

        this.user = null;

        return true;
      },

      async register(data: IRegisterMutationVariables) {
        const resp = await useMutation<IRegisterMutation, IRegisterMutationVariables>(Register)(data);

        const info = resp?.data?.register ?? null;

        if (info?.entity) {
          this.user = info.entity;
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

      async updateProfile(data: IUpdateProfileMutationVariables) {
        const resp = await useMutation<IUpdateProfileMutation, IUpdateProfileMutationVariables>(UpdateProfile)(data);

        const info = resp?.data?.updateProfile ?? null;

        if (info?.entity) {
          this.user = info.entity;
        }

        return info;
      },

      async updatePassword(data: IUpdatePasswordMutationVariables) {
        const resp = await useMutation<IUpdatePasswordMutation, IUpdatePasswordMutationVariables>(UpdatePassword)(data);

        const info = resp?.data?.updatePassword ?? null;

        if (info?.entity) {
          this.user = info.entity;
        }

        return info;
      },
    },
  },
);
