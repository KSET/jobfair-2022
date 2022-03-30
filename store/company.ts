import {
  defineStore,
} from "pinia";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  Company,
  CurrentCompanyApplication,
  ICompanyApplicationApproval,
  ICompanyQuery,
  ICurrentCompanyApplicationQuery,
  ICurrentCompanyApplicationQueryVariables,
  IQueryCompanyArgs,
  IRegisterCompanyMutation,
  IRegisterCompanyMutationVariables,
  IUpdateCompanyInfoMutation,
  IUpdateCompanyInfoMutationVariables,
  IValidateVatMutation,
  IValidateVatMutationVariables,
  RegisterCompany,
  UpdateCompanyInfo,
  ValidateVat,
} from "~/graphql/schema";
import {
  useTalkCategoriesStore,
} from "~/store/talkCategories";

type Approval = Omit<ICompanyApplicationApproval, "forApplication"> | null | undefined;

const isApplicationApproved =
  (
    approval: Approval,
  ) =>
    Object
      .values(approval || {})
      .some((x) => x)
    || false
;

export const useCompanyStore = defineStore(
  "companies",
  {
    state: () => ({
      applicationInfo: null as (null | ICurrentCompanyApplicationQuery),
    }),

    getters: {
      hasApplication(state) {
        return Boolean(state.applicationInfo?.companyApplication);
      },

      hasApplicationApproved(state) {
        return isApplicationApproved(state.applicationInfo?.companyApplication?.approval);
      },
    },

    actions: {
      async validateVat(vat: string) {
        const resp = await useMutation<IValidateVatMutation, IValidateVatMutationVariables>(ValidateVat)({
          vat,
        });

        return resp?.data?.validateVat || null;
      },

      async fetchCompany(vat: string) {
        const resp = await useQuery<ICompanyQuery, IQueryCompanyArgs>({
          query: Company,
          variables: {
            vat,
          },
        })();

        return resp?.data?.company || null;
      },

      async fetchCurrentApplication() {
        const talkCategoriesStore = useTalkCategoriesStore();

        const resp = await useQuery<ICurrentCompanyApplicationQuery, ICurrentCompanyApplicationQueryVariables>({
          query: CurrentCompanyApplication,
        })();

        const info = resp?.data || null;

        this.applicationInfo = info;
        talkCategoriesStore.setTalkCategories(info?.talkCategories);

        return info;
      },

      async registerCompany(variables: IRegisterCompanyMutationVariables) {
        const resp = await useMutation<IRegisterCompanyMutation, IRegisterCompanyMutationVariables>(RegisterCompany)(variables);

        return resp?.data?.registerCompany || null;
      },

      async updateCompanyInfo(variables: IUpdateCompanyInfoMutationVariables) {
        const resp = await useMutation<IUpdateCompanyInfoMutation, IUpdateCompanyInfoMutationVariables>(UpdateCompanyInfo)(variables);

        return resp?.data?.updateCompanyInfo || null;
      },

      isApplicationApproved(approval: Approval) {
        return isApplicationApproved(approval);
      },
    },
  },
);
