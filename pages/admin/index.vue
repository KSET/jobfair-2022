<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="admin.header" />
    </h1>

    <div>
      <ul>
        <li
          v-for="industry in industries"
          :key="industry"
        >
          <edit-industry
            :disabled="info.industriesLoading"
            :model-value="industry"
            @save="handleIndustryEdit(industry, $event)"
          />
        </li>
        <li>
          <form @submit.prevent="handleCategorySubmit">
            <input
              v-model="info.newIndustry"
              :disabled="info.industriesLoading"
              type="text"
            >
            <button
              :disabled="info.industriesLoading"
              class="ml-3"
            >
              Create
            </button>
          </form>
        </li>
      </ul>
    </div>

    <div>
      hello
    </div>
  </app-max-width-container>
</template>
<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import EditIndustry from "~/components/admin/industries/edit-industry.vue";

  export default defineComponent({
    name: "PageAdminHome",

    components: {
      EditIndustry,
      TranslatedText,
      AppMaxWidthContainer,
    },

    async setup() {
      useTitle("admin.header");

      const industriesStore = useIndustriesStore();

      const info = reactive({
        newIndustry: "",
        industriesLoading: false,
      });

      const industriesDelta = ref([] as string[]);

      const industries = computed({
        get: () => industriesStore.industries,
        set: (val) => industriesDelta.value = val,
      });

      await industriesStore.fetchIndustries();

      return {
        industries,
        info,
        async handleCategorySubmit() {
          info.industriesLoading = true;
          const resp = await industriesStore.createIndustry(info.newIndustry);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await industriesStore.fetchIndustries();
            info.newIndustry = "";
          }
          info.industriesLoading = false;
        },
        async handleIndustryEdit(oldName: string, newName: string) {
          info.industriesLoading = true;
          const resp = await industriesStore.renameIndustry(oldName, newName);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await industriesStore.fetchIndustries();
          }
          info.industriesLoading = false;
        },
      };
    },
  });
</script>
