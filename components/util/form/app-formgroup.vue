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
        :key="`textarea---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
        :key="`dropdown---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
        :key="`file---${inputName}`"
        v-model="input.value"
        :accept="input.accept"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
      <app-slider
        v-else-if="input.type === 'slider'"
        :key="`slider---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${prefix}${inputName}`"
        :max="input.max ?? 10"
        :min="input.min ?? 0"
        :name="inputName"
        :required="input.required ?? true"
        :step="input.step ?? 1"
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
      </app-slider>
      <app-number-range-input
        v-else-if="input.type === 'number-range'"
        :key="`number-range---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
        ]"
        :disabled="input.disabled || input.loading || loading"
        :invalid="errors[inputName].length > 0"
        :label-key="`form.${prefix}${inputName}`"
        :max="input.max ?? 10"
        :min="input.min ?? 0"
        :name="inputName"
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
      </app-number-range-input>
      <app-multi-pick
        v-else-if="input.type === 'multi-pick'"
        :key="`multi-pick---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
      </app-multi-pick>
      <app-single-pick
        v-else-if="input.type === 'single-pick'"
        :key="`single-pick-----${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
      </app-single-pick>
      <AppEditor
        v-else-if="input.type === 'editor'"
        :key="`editor---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
      </AppEditor>
      <app-input
        v-else
        :key="`${input.type}---${inputName}`"
        v-model="input.value"
        :class="[
          $style.formElement,
          ...toClass(input.classes)
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
  import TranslatedText from "~/components/TranslatedText.vue";
  import useModelWrapper from "~/composables/useModelWrapper";
  import {
    computed,
  } from "#imports";
  import {
    toClass,
  } from "~/helpers/style";

  export default defineComponent({
    components: {
      AppFileInput: defineAsyncComponent(() => import("~/components/util/form/app-file-input.vue")),
      AppDropdown: defineAsyncComponent(() => import("~/components/util/form/app-dropdown.vue")),
      AppInput: defineAsyncComponent(() => import("~/components/util/form/app-input.vue")),
      AppTextarea: defineAsyncComponent(() => import("~/components/util/form/app-textarea.vue")),
      AppSlider: defineAsyncComponent(() => import("~/components/util/form/app-slider.vue")),
      AppNumberRangeInput: defineAsyncComponent(() => import("~/components/util/form/app-number-range-input.vue")),
      AppMultiPick: defineAsyncComponent(() => import("~/components/util/form/app-multi-pick.vue")),
      AppSinglePick: defineAsyncComponent(() => import("~/components/util/form/app-single-pick.vue")),
      AppEditor: defineAsyncComponent(() => import("~/components/util/form/app-editor.vue")),
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

        toClass,
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
