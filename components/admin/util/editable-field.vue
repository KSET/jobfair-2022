<template>
  <div :class="$style.editableField">
    <div v-if="!isEditing" :class="$style.viewMode">
      <span :class="$style.value">{{ modelValue }}</span>
      <p-button
        :disabled="disabled"
        icon="pi pi-pencil"
        class="p-button-text p-button-sm"
        @click="startEdit"
      />
    </div>
    <div v-else :class="$style.editMode">
      <InputText
        v-model="editValue"
        :disabled="disabled"
        type="text"
        :class="$style.input"
        @keyup.enter="handleSave"
        @keyup.esc="cancelEdit"
      />
      <p-button
        :disabled="disabled"
        icon="pi pi-check"
        class="p-button-success p-button-sm"
        @click="handleSave"
      />
      <p-button
        :disabled="disabled"
        icon="pi pi-times"
        class="p-button-danger p-button-sm"
        @click="cancelEdit"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import InputText from "primevue/inputtext";
  import Button from "primevue/button";
  import {
    defineComponent,
    ref,
  } from "vue";

  export default defineComponent({
    components: {
      InputText,
      PButton: Button,
    },

    props: {
      modelValue: {
        type: String,
        required: true,
      },

      disabled: {
        type: Boolean,
        required: false,
        default: () => false,
      },
    },

    emits: [
      "update:modelValue",
      "save",
    ],

    setup(props, { emit }) {
      const isEditing = ref(false);
      const editValue = ref("");

      const startEdit = () => {
        editValue.value = props.modelValue;
        isEditing.value = true;
      };

      const cancelEdit = () => {
        isEditing.value = false;
        editValue.value = "";
      };

      const handleSave = () => {
        if (editValue.value !== props.modelValue) {
          emit("save", editValue.value);
        }
        isEditing.value = false;
      };

      return {
        isEditing,
        editValue,
        startEdit,
        cancelEdit,
        handleSave,
      };
    },
  });
</script>

<style lang="scss" module>
  .editableField {
    width: 100%;
  }

  .viewMode {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .editMode {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .input {
    flex: 1;
    min-width: 0;
  }
</style>
