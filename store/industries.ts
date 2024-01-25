import {
  defineStore,
} from "pinia";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  CreateIndustry,
  type ICreateIndustryMutation,
  type ICreateIndustryMutationVariables,
  type IIndustriesQuery,
  type IIndustriesQueryVariables,
  type IIndustry,
  Industries,
  type IRenameIndustryMutation,
  type IRenameIndustryMutationVariables,
  RenameIndustry,
} from "~/graphql/schema";

export const useIndustriesStore = defineStore(
  "industries",
  {
    state: () => ({
      industries: [] as string[],
    }),

    actions: {
      async fetchIndustries() {
        const resp = await useQuery<IIndustriesQuery, IIndustriesQueryVariables>({
          query: Industries,
        })();

        return this.setIndustries(resp?.data?.industries);
      },

      setIndustries(industries?: IIndustry[]) {
        if (!industries) {
          return;
        }

        this.industries = industries.map(({ name }) => name);
      },

      async createIndustry(name: string) {
        const resp = await useMutation<ICreateIndustryMutation, ICreateIndustryMutationVariables>(CreateIndustry)({
          name,
        });

        if (!resp?.data?.createIndustry) {
          return null;
        }

        return resp?.data?.createIndustry ?? null;
      },

      async renameIndustry(oldName: string, newName: string) {
        const resp = await useMutation<IRenameIndustryMutation, IRenameIndustryMutationVariables>(RenameIndustry)({
          oldName,
          newName,
        });

        if (!resp?.data?.renameIndustry) {
          return null;
        }

        return resp?.data?.renameIndustry ?? null;
      },
    },
  },
);
