import {
  defineStore,
} from "pinia";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  Company,
  ICompanyQuery,
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

export const useCompanyStore = defineStore(
  "companies",
  {
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

      async registerCompany(variables: IRegisterCompanyMutationVariables) {
        const resp = await useMutation<IRegisterCompanyMutation, IRegisterCompanyMutationVariables>(RegisterCompany)(variables);

        return resp?.data?.registerCompany || null;
      },

      async updateCompanyInfo(variables: IUpdateCompanyInfoMutationVariables) {
        const resp = await useMutation<IUpdateCompanyInfoMutation, IUpdateCompanyInfoMutationVariables>(UpdateCompanyInfo)(variables);

        return resp?.data?.updateCompanyInfo || null;
      },
    },
  },
);
