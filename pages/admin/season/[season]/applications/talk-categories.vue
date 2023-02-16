<template>
  <app-max-width-container>
    <h1>
      {{ seasonName }} / Talk Categories
    </h1>

    <ul>
      <li v-for="talkCategory in talkCategories" :key="talkCategory">
        <editable-field
          :disabled="isLoading"
          :model-value="talkCategory"
          @save="handleTalkCategoryEdit(talkCategory, $event)"
        />
      </li>
      <li>
        <form @submit.prevent="handleTalkCategorySubmit">
          <input v-model="newTalkCategory" :disabled="isLoading" type="text">
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
    useTalkCategoriesStore,
  } from "~/store/talkCategories";

  export default defineComponent({
    name: "PageAdminSeasonTalkCategories",

    components: {
      AppMaxWidthContainer,
      EditableField,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const talkCategoriesStore = useTalkCategoriesStore();

      const seasonUid = seasonsStore.season!.uid!;

      const title = computed(() => `Admin - ${ seasonsStore.season?.name ?? "" } - Talk Categories`);
      useTitle(title, false);

      await talkCategoriesStore.fetchTalkCategories(seasonUid);

      const talkCategoriesDelta = ref([] as string[]);
      const talkCategories = computed({
        get: () => talkCategoriesStore.talkCategories,
        set: (val) => talkCategoriesDelta.value = val,
      });

      const isLoading = ref(false);
      const newTalkCategory = ref("");

      return {
        talkCategories,
        seasonName: computed(() => seasonsStore.season!.name),
        isLoading,
        newTalkCategory,
        async handleTalkCategorySubmit() {
          isLoading.value = true;
          const resp = await talkCategoriesStore.createTalkCategory(newTalkCategory.value, seasonUid);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await talkCategoriesStore.fetchTalkCategories(seasonUid);
            newTalkCategory.value = "";
          }
          isLoading.value = false;
        },
        async handleTalkCategoryEdit(oldName: string, newName: string) {
          isLoading.value = true;
          const resp = await talkCategoriesStore.renameTalkCategory(oldName, newName, seasonUid);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await talkCategoriesStore.fetchTalkCategories(seasonUid);
          }
          isLoading.value = false;
        },
      };
    },
  });
</script>
