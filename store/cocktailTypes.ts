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
  CreateCocktailType,
  type IApplicationCocktailType,
  type ICreateCocktailTypeMutation,
  type ICreateCocktailTypeMutationVariables,
  type IRenameCocktailTypeMutation,
  type IRenameCocktailTypeMutationVariables,
  type ISeason,
  type ICocktailTypesQuery,
  type ICocktailTypesQueryVariables,
  RenameCocktailType,
  CocktailTypes,
} from "~/graphql/schema";

export const useCocktailTypesStore = defineStore(
  "cocktailTypes",
  {
    state: () => ({
      cocktailTypes: [] as string[],
    }),

    actions: {
      async fetchCocktailTypes(forSeason?: ISeason["uid"]) {
        const seasonsStore = useSeasonsStore();

        const season = forSeason ?? seasonsStore.season?.uid ?? seasonsStore.currentSeason?.uid;

        const resp = await useQuery<ICocktailTypesQuery, ICocktailTypesQueryVariables>({
          query: CocktailTypes,
          variables: {
            season,
          },
        })();

        return this.setCocktailTypes(resp?.data?.cocktailTypes);
      },

      setCocktailTypes(types?: IApplicationCocktailType[]) {
        if (!types) {
          return;
        }

        this.cocktailTypes = types.map(({ type }) => type);
      },

      async createCocktailType(type: string, season: ISeason["uid"]) {
        const resp = await useMutation<ICreateCocktailTypeMutation, ICreateCocktailTypeMutationVariables>(CreateCocktailType)({
          type,
          season,
        });

        if (!resp?.data?.createCocktailType) {
          return null;
        }

        return resp?.data?.createCocktailType ?? null;
      },

      async renameCocktailType(oldCocktailType: string, newCocktailType: string, season: ISeason["uid"]) {
        const resp = await useMutation<IRenameCocktailTypeMutation, IRenameCocktailTypeMutationVariables>(RenameCocktailType)({
          oldCocktailType,
          newCocktailType,
          season,
        });

        if (!resp?.data?.renameCocktailType) {
          return null;
        }

        return resp?.data?.renameCocktailType ?? null;
      },
    },
  },
);
