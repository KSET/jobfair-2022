<template>
  <app-max-width-container>
    <h1>{{ seasonName }} / Ponuda Koktela</h1>

    <div :class="$style.createSection">
      <form :class="$style.createForm" @submit.prevent="handleCocktailTypeSubmit">
        <InputText
          v-model="newCocktailType"
          :disabled="isLoading"
          placeholder="Novi tip koktela"
          :class="$style.createInput"
        />
        <p-button
          type="submit"
          :disabled="isLoading || !newCocktailType.trim()"
          :loading="isLoading"
          icon="pi pi-plus"
          label="Dodaj tip"
        />
      </form>
    </div>

    <DataTable
      :value="cocktailTypesData"
      :loading="isLoading"
      data-key="type"
      row-hover
      responsive-layout="scroll"
    >
      <Column field="type" header="Tip koktela" sortable>
        <template #body="{ data }">
          <editable-field
            :disabled="isLoading"
            :model-value="data.type"
            @save="handleCocktailTypeEdit(data.type, $event)"
          />
        </template>
      </Column>

      <Column field="assignedCompany" header="Dodijeljena firma" sortable>
        <template #body="{ data }">
          <p-chip
            v-if="data.assignedCompany"
            :label="data.assignedCompany"
          />
          <span v-else :class="$style.availableText">Dostupno</span>
        </template>
      </Column>

      <Column field="cocktailName" header="Naziv koktela" sortable>
        <template #body="{ data }">
          <em v-if="data.cocktailName">{{ data.cocktailName }}</em>
          <span v-else :class="$style.emptyText">-</span>
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputText from "primevue/inputtext";
  import Chip from "primevue/chip";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import EditableField from "~/components/admin/util/editable-field.vue";
  import {
    useTitle,
    computed,
    ref,
    defineComponent,
    useQuery,
  } from "#imports";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useCocktailTypesStore,
  } from "~/store/cocktailTypes";
  import {
    AdminCompanyApplications,
    type IAdminCompanyApplicationsQuery,
    type IAdminCompanyApplicationsQueryVariables,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminSeasonCocktailTypes",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
      InputText,
      PChip: Chip,
      EditableField,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const cocktailTypesStore = useCocktailTypesStore();
      const toast = useToast();

      const seasonUid = seasonsStore.season!.uid!;

      const title = computed(() => `Admin - ${ seasonsStore.season?.name ?? "" } - Cocktail Types`);
      useTitle(title, false);

      await cocktailTypesStore.fetchCocktailTypes(seasonUid);

      const companyApplications = ref<NonNullable<IAdminCompanyApplicationsQuery["companyApplications"]>>([]);

      const loadCompanyApplications = async () => {
        if (import.meta.client) {
          const res = await useQuery<
            IAdminCompanyApplicationsQuery,
            IAdminCompanyApplicationsQueryVariables
          >({
            query: AdminCompanyApplications,
            variables: { season: seasonUid },
          })().then((res) => res?.data);

          companyApplications.value = res?.companyApplications || [];
        }
      };

      await loadCompanyApplications();

      const cocktailTypesData = computed(() => {
        return cocktailTypesStore.cocktailTypes.map((type) => {
          const assignedApp = companyApplications.value.find(
            (app) => app.wantsCocktail && app.cocktail?.type?.type === type,
          );

          return {
            type,
            assignedCompany: assignedApp?.forCompany?.brandName || null,
            cocktailName: assignedApp?.cocktail?.name || null,
            companyUid: assignedApp?.forCompany?.uid || null,
            isAssigned: !!assignedApp,
          };
        });
      });

      const isLoading = ref(false);
      const newCocktailType = ref("");

      return {
        cocktailTypesData,
        seasonName: computed(() => seasonsStore.season!.name),
        isLoading,
        newCocktailType,

        async handleCocktailTypeSubmit() {
          if (!newCocktailType.value.trim()) {
            return;
          }

          isLoading.value = true;
          const resp = await cocktailTypesStore.createCocktailType(newCocktailType.value, seasonUid);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri kreiranju tipa koktela. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await cocktailTypesStore.fetchCocktailTypes(seasonUid);
            await loadCompanyApplications();
            newCocktailType.value = "";
          }
          isLoading.value = false;
        },

        async handleCocktailTypeEdit(oldCocktailType: string, newCocktailType: string) {
          isLoading.value = true;
          const resp = await cocktailTypesStore.renameCocktailType(oldCocktailType, newCocktailType, seasonUid);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri preimenovanju tipa koktela. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await cocktailTypesStore.fetchCocktailTypes(seasonUid);
            await loadCompanyApplications();
          }
          isLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .createSection {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
  }

  .createForm {
    display: flex;
    gap: 1rem;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  .createInput {
    flex: 1;
    max-width: 400px;

    @media (max-width: 768px) {
      max-width: 100%;
    }
  }

  .availableText {
    color: #6c757d;
    font-style: italic;
  }

  .emptyText {
    color: #6c757d;
  }
</style>
