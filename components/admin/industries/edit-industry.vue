<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="industry"
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
      const industryChanged = ref(props.modelValue);
      const industry = computed({
        get: () => props.modelValue,
        set: (value) => industryChanged.value = value,
      });

      return {
        industry,
        handleSubmit() {
          emit(
            "save",
            unref(industryChanged),
          );
        },
      };
    },
  });
</script>
