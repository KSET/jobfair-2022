<template>
  <app-max-width-container>
    <h1>Industrije</h1>

    <div :class="$style.createSection">
      <form :class="$style.createForm" @submit.prevent="handleIndustrySubmit">
        <InputText
          v-model="newIndustry"
          :disabled="isLoading"
          placeholder="Nova industrija"
          :class="$style.createInput"
        />
        <InputText
          v-model="newIndustryEn"
          :disabled="isLoading"
          placeholder="Engleski naziv (opcionalno)"
          :class="$style.createInput"
        />
        <p-button
          type="submit"
          :disabled="isLoading || !newIndustry.trim()"
          :loading="isLoading"
          icon="pi pi-plus"
          label="Dodaj industriju"
        />
      </form>
    </div>

    <DataTable
      :value="industriesStore.industryEntries"
      :loading="isLoading"
      data-key="name"
      row-hover
      responsive-layout="scroll"
    >
      <Column field="name" header="Naziv industrije" sortable>
        <template #body="{ data }">
          <editable-field
            :disabled="isLoading"
            :model-value="data.name"
            @save="handleIndustryUpdate(data.name, { name: $event })"
          />
        </template>
      </Column>
      <Column field="nameEn" header="Naziv (EN)" sortable>
        <template #body="{ data }">
          <editable-field
            :disabled="isLoading"
            :model-value="data.nameEn"
            @save="handleIndustryUpdate(data.name, { nameEn: $event })"
          />
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputText from "primevue/inputtext";
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
  } from "#imports";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    type IUpdateIndustryInput,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminIndustries",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
      InputText,
      EditableField,
    },

    async setup() {
      const industriesStore = useIndustriesStore();
      const toast = useToast();

      const title = computed(() => "Admin - Industrije");
      useTitle(title, false);

      await industriesStore.fetchIndustries();

      const isLoading = ref(false);
      const newIndustry = ref("");
      const newIndustryEn = ref("");

      return {
        industriesStore,
        isLoading,
        newIndustry,
        newIndustryEn,

        async handleIndustrySubmit() {
          if (!newIndustry.value.trim()) {
            return;
          }

          isLoading.value = true;
          const resp = await industriesStore.createIndustry(newIndustry.value, newIndustryEn.value);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri kreiranju industrije. Provjerite da naziv i engleski naziv već ne postoje.",
              life: 3000,
            });
          } else {
            newIndustry.value = "";
            newIndustryEn.value = "";
          }
          isLoading.value = false;
        },

        async handleIndustryUpdate(name: string, data: IUpdateIndustryInput) {
          if ("string" === typeof data.name && !data.name.trim()) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Naziv industrije ne može biti prazan.",
              life: 3000,
            });
            return;
          }

          isLoading.value = true;
          const resp = await industriesStore.updateIndustry(name, data);
          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri spremanju industrije. Naziv ili engleski naziv možda već postoji. Pokušajte ponovo.",
              life: 3000,
            });
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
</style>
