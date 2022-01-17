<template>
  <div
    v-if="isShown"
    :class="$style.container"
  >
    <fieldset>
      <legend>Translations</legend>
      <div>
        <label class="flex">
          <input-switch v-model="checked" />
          <span class="ml-3">Editable</span>
        </label>
      </div>
      <div class="mt-3">
        <p-dropdown
          v-model="selectedLanguage"
          :options="availableLanguages"
          option-label="label"
          option-value="value"
        />
      </div>
    </fieldset>
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    watch,
  } from "vue";
  import InputSwitch from "primevue/inputswitch";
  import Dropdown from "primevue/dropdown";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    components: {
      InputSwitch,
      PDropdown: Dropdown,
    },

    setup() {
      const translationsStore = useTranslationsStore();

      const checked = ref(translationsStore.isEditable);
      watch(checked, (value) => {
        translationsStore.isEditable = value;
      });

      const selectedLanguage = ref(translationsStore.currentLanguage);
      watch(selectedLanguage, (value) => {
        translationsStore.currentLanguage = value;
      });

      return {
        isShown: true,
        checked,
        availableLanguages: Object.entries(Language).map(([ label, value ]) => ({ label, value })),
        selectedLanguage,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include";

  .container {
    position: fixed;
    z-index: 999;
    bottom: 1rem;
    left: 1rem;
    padding: .5rem .8rem;
    color: $fer-black;
    border-radius: 4px;
    background: $fer-white;
    box-shadow: #{map.get($shadows, "shadow-4")};

    :global(.p-inputtext) {
      padding: .4rem .8rem;
    }
  }
</style>
