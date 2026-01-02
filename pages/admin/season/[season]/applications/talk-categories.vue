<template>
  <app-max-width-container>
    <h1>{{ seasonName }} / Talk Categories</h1>

    <div :class="$style.createSection">
      <form :class="$style.createForm" @submit.prevent="handleTalkCategorySubmit">
        <InputText
          v-model="newTalkCategory"
          :disabled="isLoading"
          placeholder="Nova kategorija talka"
          :class="$style.createInput"
        />
        <p-button
          type="submit"
          :disabled="isLoading || !newTalkCategory.trim()"
          :loading="isLoading"
          icon="pi pi-plus"
          label="Dodaj kategoriju"
        />
      </form>
    </div>

    <DataTable
      :value="talkCategoriesData"
      :loading="isLoading"
      data-key="name"
      row-hover
      responsive-layout="scroll"
    >
      <Column field="name" header="Kategorija talka" sortable>
        <template #body="{ data }">
          <editable-field
            :disabled="isLoading"
            :model-value="data.name"
            @save="handleTalkCategoryEdit(data.name, $event)"
          />
        </template>
      </Column>

      <Column field="companiesCount" header="Broj prijava" sortable>
        <template #body="{ data }">
          <span :class="$style.count">{{ data.companiesCount }}</span>
        </template>
      </Column>

      <Column field="companies" header="Firme">
        <template #body="{ data }">
          <div :class="$style.companiesWrapper">
            <p-chip
              v-for="company in data.companies"
              :key="company.uid"
              :label="company.name"
              :class="$style.companyChip"
            />
            <span v-if="data.companies.length === 0" :class="$style.emptyText">Nema prijava</span>
          </div>
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
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import {
    AdminCompanyApplications,
    type IAdminCompanyApplicationsQuery,
    type IAdminCompanyApplicationsQueryVariables,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminSeasonTalkCategories",

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
      const talkCategoriesStore = useTalkCategoriesStore();
      const toast = useToast();

      const seasonUid = seasonsStore.season!.uid!;

      const title = computed(() => `Admin - ${ seasonsStore.season?.name ?? "" } - Talk Categories`);
      useTitle(title, false);

      await talkCategoriesStore.fetchTalkCategories(seasonUid);

      const companyApplications = ref<NonNullable<IAdminCompanyApplicationsQuery["companyApplications"]>>([]);

      // Function to load company applications data
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

      // Load initial data
      await loadCompanyApplications();

      const talkCategoriesData = computed(() => {
        return talkCategoriesStore.talkCategories.map((category) => {
          const companiesWithTalksInCategory = companyApplications.value.filter(
            (app) => app.talk?.category?.name === category,
          );

          return {
            name: category,
            companiesCount: companiesWithTalksInCategory.length,
            companies: companiesWithTalksInCategory.map((app) => ({
              uid: app.forCompany?.uid || "",
              name: app.forCompany?.brandName || "",
              talkTitle: app.talk?.titleEn || "",
            })),
          };
        });
      });

      const isLoading = ref(false);
      const newTalkCategory = ref("");

      return {
        talkCategoriesData,
        seasonName: computed(() => seasonsStore.season!.name),
        isLoading,
        newTalkCategory,

        async handleTalkCategorySubmit() {
          if (!newTalkCategory.value.trim()) {
            return;
          }

          isLoading.value = true;
          const resp = await talkCategoriesStore.createTalkCategory(newTalkCategory.value, seasonUid);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri kreiranju kategorije. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await talkCategoriesStore.fetchTalkCategories(seasonUid);
            await loadCompanyApplications();
            newTalkCategory.value = "";
          }
          isLoading.value = false;
        },

        async handleTalkCategoryEdit(oldName: string, newName: string) {
          isLoading.value = true;
          const resp = await talkCategoriesStore.renameTalkCategory(oldName, newName, seasonUid);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri preimenovanju kategorije. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await talkCategoriesStore.fetchTalkCategories(seasonUid);
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

  .count {
    font-weight: 600;
    color: #495057;
  }

  .companiesWrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .companyChip {
    font-size: 0.875rem;
  }

  .emptyText {
    color: #6c757d;
    font-style: italic;
  }
</style>
