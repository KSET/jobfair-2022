<template>
  <div
    v-if="isShown"
    :class="$style.container"
  >
    <fieldset>
      <legend>Translations</legend>
      <div>
        <label class="flex">
          <input-switch
            v-model="checked"
            :disabled="isLoading"
          />
          <span
            :class="$style.inputLabel"
          >Editable</span>
        </label>
      </div>
      <div class="mt-3">
        <p-dropdown
          v-model="selectedLanguage"
          :loading="isLoading"
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
      const isLoading = ref(false);

      const checked = ref(translationsStore.isEditable);
      watch(checked, (value) => {
        translationsStore.isEditable = value;
      });

      const selectedLanguage = ref(translationsStore.currentLanguage);
      watch(selectedLanguage, async (value: Language, oldValue: Language) => {
        isLoading.value = true;
        try {
          await translationsStore.setCurrentLanguage(value);
        } catch {
          selectedLanguage.value = oldValue;
        } finally {
          isLoading.value = false;
        }
      });

      return {
        isShown: true,
        checked,
        availableLanguages: Object.entries(Language).map(([ label, value ]) => ({ label, value })),
        selectedLanguage,
        isLoading,
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

    :global(label) {
      cursor: pointer;
    }

    .inputLabel {
      margin-left: 1rem;
      user-select: none;
    }
  }
</style>
