<template>
  <component
    :is="noForm ? 'div' : 'form'"
    :aria-disabled="loading"
    :class="$style.container"
    role="form"
    @submit.prevent="!noForm && $emit('submit', true)"
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
        :label-key="`form.${prefix}${inputName}`"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? true"
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
        :label-key="`form.${prefix}${inputName}`"
        :name="inputName"
        :options="input.options"
        :placeholder="input.placeholder"
        :required="input.required ?? true"
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
      </app-dropdown>
      <app-file-input
        v-else-if="input.type === 'file'"
        :key="`${input.type}-${inputName}`"
        v-model="input.value"
        :accept="input.accept"
        :class="[
          $style.formElement,
          ...(input.classes ?? [])
        ]"
        :disabled="input.disabled || input.loading || loading"
        :file-name="input.fileName"
        :file-type="input.fileType"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${prefix}${inputName}`"
        :multiple="input.multiple ?? false"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? true"
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
      </app-file-input>
      <app-input
        v-else-if="input.type === 'datetime-local'"
        :key="`${input.type}-${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...(input.classes ?? [])
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${prefix}${inputName}`"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? true"
        type="datetime-local"
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
      </app-input>
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
        :label-key="`form.${prefix}${inputName}`"
        :name="inputName"
        :placeholder="input.placeholder"
        :required="input.required ?? true"
        :type="input.type || 'text'"
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
      </app-input>
    </template>
    <slot
      name="after"
    />
  </component>
</template>

<script lang="ts">
  import {
    defineAsyncComponent,
    defineComponent,
  } from "vue";
  import {
    MaybeRef,
  } from "@vueuse/shared";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useModelWrapper from "~/composables/useModelWrapper";
  import {
    computed,
  } from "#imports";

  type ClassDefinition = Record<string, boolean> | string;

  type InputBase = {
    placeholder?: string,
    loading?: boolean,
    required?: boolean,
    disabled?: boolean,
    attrs?: Record<string, unknown>,
    classes?: ClassDefinition | ClassDefinition[],
  };

  type InputText = InputBase & (
    {
      value: string,
      type:
        "text"
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
    | {
      type:
        "date",
      value: string | Date,
    }
  );

  type InputDropdown = InputBase & {
    value: string | string[],
    type: "dropdown",
    options: MaybeRef<{
      label: string,
      value: string,
    }[]>,
  };

  type InputTextarea = InputBase & {
    value: string,
    type: "textarea",
  };

  type InputFile = InputBase & {
    value: string,
    type: "file",
    accept?: MaybeRef<string | string[]>,
    fileName?: MaybeRef<string>,
    fileType?: MaybeRef<string>,
    multiple?: MaybeRef<boolean>,
  };

  export type InputEntry =
    InputText
    | InputDropdown
    | InputTextarea
    | InputFile
  ;

  export default defineComponent({
    components: {
      AppFileInput: defineAsyncComponent(() => import("~/components/util/form/app-file-input.vue")),
      AppDropdown: defineAsyncComponent(() => import("~/components/util/form/app-dropdown.vue")),
      AppInput: defineAsyncComponent(() => import("~/components/util/form/app-input.vue")),
      AppTextarea: defineAsyncComponent(() => import("~/components/util/form/app-textarea.vue")),
      TranslatedText,
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
      noForm: {
        required: false,
        type: Boolean,
        default: () => false,
      },
      labelPrefix: {
        required: false,
        type: String,
        default: () => "",
      },
    },

    emits: [
      "submit",
    ],

    setup(props, { emit }) {
      const labelPrefix = useModelWrapper(props, emit)("labelPrefix");

      return {
        prefix: computed(() => {
          const prefix = labelPrefix.value;

          if (!prefix) {
            return "";
          }

          if ("." !== prefix[prefix.length - 1]) {
            return `${ prefix }.`;
          }

          return prefix;
        }),
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    gap: 2.5em;

    @include media(lg) {
      gap: 1.875em;
    }

    .formElement {
      width: 100%;
    }
  }
</style>
