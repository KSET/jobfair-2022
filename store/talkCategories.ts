import {
  defineStore,
} from "pinia";
import {
  useMutation,
  useQuery,
} from "~/composables/useQuery";
import {
  CreateTalkCategory,
  IApplicationTalkCategory,
  ICreateTalkCategoryMutation,
  ICreateTalkCategoryMutationVariables,
  IRenameTalkCategoryMutation,
  IRenameTalkCategoryMutationVariables,
  ITalkCategoriesQuery,
  ITalkCategoriesQueryVariables,
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
      async fetchTalkCategories() {
        const resp = await useQuery<ITalkCategoriesQuery, ITalkCategoriesQueryVariables>({
          query: TalkCategories,
        })();

        return this.setTalkCategories(resp?.data?.talkCategories);
      },

      setTalkCategories(categories?: IApplicationTalkCategory[]) {
        if (!categories) {
          return;
        }

        this.talkCategories = categories.map(({ name }) => name);
      },

      async createTalkCategory(name: string) {
        const resp = await useMutation<ICreateTalkCategoryMutation, ICreateTalkCategoryMutationVariables>(CreateTalkCategory)({
          name,
        });

        if (!resp?.data?.createTalkCategory) {
          return null;
        }

        return resp?.data?.createTalkCategory ?? null;
      },

      async renameTalkCategory(oldName: string, newName: string) {
        const resp = await useMutation<IRenameTalkCategoryMutation, IRenameTalkCategoryMutationVariables>(RenameTalkCategory)({
          oldName,
          newName,
        });

        if (!resp?.data?.renameTalkCategory) {
          return null;
        }

        return resp?.data?.renameTalkCategory ?? null;
      },
    },
  },
);
