<template>
  <form
    :aria-disabled="loading"
    :class="$style.container"
    @submit.prevent="$emit('submit', true)"
  >
    <template
      v-for="(input, inputName) in inputs"
    >
      <app-textarea
        v-if="input.type === 'textarea'"
        :key="`${input.type}-${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...(input.classes ?? [])
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${inputName}`"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? false"
        v-bind="input.attrs || {}"
      >
        <template v-if="errors[inputName].length > 0" #message>
          <translated-text
            v-for="err in errors[inputName]"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-textarea>
      <app-dropdown
        v-else-if="input.type === 'dropdown'"
        :key="`${input.type}-${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...(input.classes ?? [])
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${inputName}`"
        :name="inputName"
        :options="input.options"
        :placeholder="input.placeholder"
        :required="input.required ?? false"
        v-bind="input.attrs || {}"
      >
        <template v-if="errors.industry.length > 0" #message>
          <translated-text
            v-for="err in errors.industry"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-dropdown>
      <app-input
        v-else
        :key="`${input.type}-${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...(input.classes ?? [])
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${inputName}`"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? false"
        :type="input.type || 'text'"
      >
        <template v-if="errors[inputName].length > 0" #message>
          <translated-text
            v-for="err in errors[inputName]"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>
    </template>
    <slot
      name="after"
    />
  </form>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import {
    MaybeRef,
  } from "@vueuse/shared";
  import AppTextarea from "~/components/util/form/app-textarea.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppInput from "~/components/util/form/app-input.vue";
  import AppDropdown from "~/components/util/form/app-dropdown.vue";

  type ClassDefinition = Record<string, boolean> | string;

  type InputBase = {
    value: string,
    placeholder?: string,
    loading?: boolean,
    required?: boolean,
    disabled?: boolean,
    attrs?: Record<string, unknown>,
    classes?: ClassDefinition | ClassDefinition[],
  };

  type InputText = InputBase & (
    {
      type:
        "text"
        | "date"
        | "datetime-local"
        | "email"
        | "month"
        | "password"
        | "search"
        | "tel"
        | "time"
        | "url"
        | "week",
    }
    |
    {
      type:
        "number",
      value: number,
    }
  );

  type InputDropdown = InputBase & {
    type: "dropdown",
    options: MaybeRef<{
      label: string,
      value: string,
    }[]>,
  };

  type InputTextarea = InputBase & {
    type: "textarea",
  };

  export type InputEntry = InputText | InputDropdown | InputTextarea;

  export default defineComponent({
    components: {
      AppDropdown,
      AppInput,
      TranslatedText,
      AppTextarea,
    },

    props: {
      inputs: {
        required: true,
        type: Object,
      },
      errors: {
        required: true,
        type: Object,
      },
      loading: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    emits: [
      "submit",
    ],
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 2.5rem;

    @include media(lg) {
      gap: 1.875rem;
    }

    .formElement {
      width: 100%;
    }
  }
</style>
