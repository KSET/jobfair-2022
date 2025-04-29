<template>
  <app-max-width-container>
    <h1>
      {{ seasonName }} / Ponuda Koktela
    </h1>

    <ul>
      <li v-for="cocktailType in cocktailTypes" :key="cocktailType" style="width: 80%;">
        <editable-field
          :disabled="isLoading"
          :model-value="cocktailType"
          @save="handleCocktailTypeEdit(cocktailType, $event)"
        />
      </li>
      <li>
        <form @submit.prevent="handleCocktailTypeSubmit">
          <input v-model="newCocktailType" :disabled="isLoading" type="text" style="width: 80%;">
          <button :disabled="isLoading" class="ml-3">
            Create
          </button>
        </form>
      </li>
    </ul>
  </app-max-width-container>
</template>

<script lang="ts">
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useTitle,
    computed,
    ref,
    defineComponent,
  } from "#imports";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import EditableField from "~/components/admin/util/editable-field.vue";
  import {
    useCocktailTypesStore,
  } from "~/store/cocktailTypes";

  export default defineComponent({
    name: "PageAdminSeasonCocktailTypes",

    components: {
      AppMaxWidthContainer,
      EditableField,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const cocktailTypesStore = useCocktailTypesStore();

      const seasonUid = seasonsStore.season!.uid!;

      const title = computed(() => `Admin - ${ seasonsStore.season?.name ?? "" } - Cocktail Types`);
      useTitle(title, false);

      await cocktailTypesStore.fetchCocktailTypes(seasonUid);

      const cocktailTypesDelta = ref([] as string[]);
      const cocktailTypes = computed({
        get: () => cocktailTypesStore.cocktailTypes,
        set: (val) => cocktailTypesDelta.value = val,
      });

      const isLoading = ref(false);
      const newCocktailType = ref("");

      return {
        cocktailTypes,
        seasonName: computed(() => seasonsStore.season!.name),
        isLoading,
        newCocktailType,
        async handleCocktailTypeSubmit() {
          isLoading.value = true;
          const resp = await cocktailTypesStore.createCocktailType(newCocktailType.value, seasonUid);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await cocktailTypesStore.fetchCocktailTypes(seasonUid);
            newCocktailType.value = "";
          }
          isLoading.value = false;
        },
        async handleCocktailTypeEdit(oldCocktailType: string, newCocktailType: string) {
          isLoading.value = true;
          const resp = await cocktailTypesStore.renameCocktailType(oldCocktailType, newCocktailType, seasonUid);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await cocktailTypesStore.fetchCocktailTypes(seasonUid);
          }
          isLoading.value = false;
        },
      };
    },
  });
</script>
