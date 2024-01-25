import {
  defineStore,
} from "pinia";
import {
  useSeasonsStore,
} from "./seasons";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  Company,
  CompanyInfo,
  CurrentCompanyApplication,
  type ICompanyApplicationApproval,
  type ICompanyInfoQuery,
  type ICompanyQuery,
  type ICurrentCompanyApplicationQuery,
  type ICurrentCompanyApplicationQueryVariables,
  type IQueryCompanyArgs,
  type IQueryCompanyInfoArgs,
  type IRegisterCompanyMutation,
  type IRegisterCompanyMutationVariables,
  type IUpdateCompanyInfoMutation,
  type IUpdateCompanyInfoMutationVariables,
  type IValidateVatMutation,
  type IValidateVatMutationVariables,
  RegisterCompany,
  UpdateCompanyInfo,
  ValidateVat,
} from "~/graphql/schema";
import {
  useTalkCategoriesStore,
} from "~/store/talkCategories";

type Approval = Partial<Omit<ICompanyApplicationApproval, "forApplication">> | null | undefined;

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
      companyInfo: null as (null | ICompanyInfoQuery["companyInfo"]),
    }),

    getters: {
      hasApplication(state) {
        return Boolean(state.applicationInfo?.companyApplication);
      },

      hasApplicationApproved(state) {
        return isApplicationApproved(state.applicationInfo?.companyApplication?.approval);
      },

      hasFeedback(state) {
        return Boolean(state.applicationInfo?.companyApplication?.feedback);
      },

      canScanUsers() {
        const seasonsStore = useSeasonsStore();

        return Boolean(this.hasApplicationApproved) && seasonsStore.isEventOngoing && false;
      },

      canViewResumes() {
        return Boolean(this.hasApplicationApproved) && Boolean(this.hasFeedback) && false;
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

      async fetchCompanyInfo(uid: string) {
        this.companyInfo = await useQuery<ICompanyInfoQuery, IQueryCompanyInfoArgs>({
          query: CompanyInfo,
          variables: {
            uid,
          },
        })().then((resp) => resp?.data?.companyInfo);

        return this.companyInfo;
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
