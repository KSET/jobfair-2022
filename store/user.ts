import {
  defineStore,
} from "pinia";
import {
  ICompany,
  ILoginMutation,
  ILoginMutationVariables,
  ILogoutMutation,
  ILogoutMutationVariables,
  IProfileQuery,
  IProfileQueryVariables,
  IRegisterMutation,
  IRegisterMutationVariables,
  IUpdatePasswordMutation,
  IUpdatePasswordMutationVariables,
  IUpdateProfileMutation,
  IUpdateProfileMutationVariables,
  Login,
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
