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
  type IUpdateIndustryInput,
  type IUpdateIndustryMutation,
  type IUpdateIndustryMutationVariables,
  UpdateIndustry,
} from "~/graphql/schema";
import {
  Language,
  useTranslationsStore,
} from "~/store/translations";

export type IndustryEntry = Pick<IIndustry, "name" | "nameEn">;

export const industryDisplayName = (
  industry: { name: string, nameEn?: string | null, },
  language: Language,
) =>
  Language.HR === language
    ? industry.name
    : industry.nameEn?.trim() || industry.name
;

export const useIndustriesStore = defineStore(
  "industries",
  {
    state: () => ({
      industryEntries: [] as IndustryEntry[],
    }),

    getters: {
      industries: (state) => state.industryEntries.map(({ name }) => name),

      industryOptions(state) {
        const language = useTranslationsStore().currentLanguage;

        return state.industryEntries.map((entry) => ({
          label: industryDisplayName(entry, language),
          value: entry.name,
        }));
      },
    },

    actions: {
      async fetchIndustries() {
        const resp = await useQuery<IIndustriesQuery, IIndustriesQueryVariables>({
          query: Industries,
        })();

        return this.setIndustries(resp?.data?.industries);
      },

      setIndustries(industries?: IndustryEntry[]) {
        if (!industries) {
          return;
        }

        this.industryEntries = industries.map(({ name, nameEn }) => ({ name, nameEn }));
      },

      async createIndustry(name: string, nameEn = "") {
        const resp = await useMutation<ICreateIndustryMutation, ICreateIndustryMutationVariables>(CreateIndustry)({
          name,
          nameEn,
        });

        const created = resp?.data?.createIndustry ?? null;
        if (created) {
          this.industryEntries.push({ name: created.name, nameEn: created.nameEn });
        }

        return created;
      },

      async updateIndustry(name: string, data: IUpdateIndustryInput) {
        const resp = await useMutation<IUpdateIndustryMutation, IUpdateIndustryMutationVariables>(UpdateIndustry)({
          name,
          data,
        });

        const updated = resp?.data?.updateIndustry ?? null;
        if (updated) {
          const index = this.industryEntries.findIndex((entry) => entry.name === name);
          if (-1 !== index) {
            this.industryEntries.splice(index, 1, { name: updated.name, nameEn: updated.nameEn });
          }
        }

        return updated;
      },
    },
  },
);
