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
  CreateTalkCategory,
  type IApplicationTalkCategory,
  type ICreateTalkCategoryMutation,
  type ICreateTalkCategoryMutationVariables,
  type IRenameTalkCategoryMutation,
  type IRenameTalkCategoryMutationVariables,
  type ISeason,
  type ITalkCategoriesQuery,
  type ITalkCategoriesQueryVariables,
  RenameTalkCategory,
  TalkCategories,
} from "~/graphql/schema";

export const useTalkCategoriesStore = defineStore(
  "talkCategories",
  {
    state: () => ({
      talkCategories: [] as string[],
    }),

    actions: {
      async fetchTalkCategories(forSeason?: ISeason["uid"]) {
        const seasonsStore = useSeasonsStore();

        const season = forSeason ?? seasonsStore.season?.uid ?? seasonsStore.currentSeason?.uid;

        const resp = await useQuery<ITalkCategoriesQuery, ITalkCategoriesQueryVariables>({
          query: TalkCategories,
          variables: {
            season,
          },
        })();

        return this.setTalkCategories(resp?.data?.talkCategories);
      },

      setTalkCategories(categories?: IApplicationTalkCategory[]) {
        if (!categories) {
          return;
        }

        this.talkCategories = categories.map(({ name }) => name);
      },

      async createTalkCategory(name: string, season: ISeason["uid"]) {
        const resp = await useMutation<ICreateTalkCategoryMutation, ICreateTalkCategoryMutationVariables>(CreateTalkCategory)({
          name,
          season,
        });

        if (!resp?.data?.createTalkCategory) {
          return null;
        }

        return resp?.data?.createTalkCategory ?? null;
      },

      async renameTalkCategory(oldName: string, newName: string, season: ISeason["uid"]) {
        const resp = await useMutation<IRenameTalkCategoryMutation, IRenameTalkCategoryMutationVariables>(RenameTalkCategory)({
          oldName,
          newName,
          season,
        });

        if (!resp?.data?.renameTalkCategory) {
          return null;
        }

        return resp?.data?.renameTalkCategory ?? null;
      },
    },
  },
);
