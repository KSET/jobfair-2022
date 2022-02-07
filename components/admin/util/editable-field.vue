<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="model"
      :disabled="disabled"
      type="text"
    >
    <button
      :disabled="disabled"
      class="ml-3"
    >
      Edit
    </button>
  </form>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
    unref,
  } from "vue";

  export default defineComponent({
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
      const modelChanged = ref(props.modelValue);
      const model = computed({
        get: () => props.modelValue,
        set: (value) => modelChanged.value = value,
      });

      return {
        model,
        handleSubmit() {
          emit(
            "save",
            unref(modelChanged),
          );
        },
      };
    },
  });
</script>
