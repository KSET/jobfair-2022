<template>
  <div
    :aria-disabled="orNone(disabled)"
    :class="$style.container"
  >
    <label
      v-if="visible.label"
      :id="id.label"
      :class="{
        [$style.label]: true,
        [$style.required]: required,
        [$style.withColon]: !noColon,
      }"
      :for="id.input"
    >
      <slot name="label">
        <translated-text
          v-if="labelKey"
          v-model="labelTranslated"
          :trans-key="labelKey"
        />
        <span
          v-else
          v-text="label"
        />
      </slot>
    </label>
    <LazyClientOnly>
      <p-multi-select
        v-if="isMultiple"
        v-model="input"
        :aria-describedby="elseNone(visible.message, id.message)"
        :aria-errormessage="elseNone(visible.label && invalid, id.label)"
        :aria-invalid="orNone(invalid)"
        :aria-label="orNone(label || labelTranslated)"
        :aria-labelledby="elseNone(visible.label, id.label)"
        :aria-required="orNone(required)"
        :class="{
          [$style.input]: true,
          ['invalid']: invalid,
        }"
        :disabled="disabled"
        :filter="!noFilter"
        :input-id="id.input"
        :name="name"
        :options="options"
        :placeholder="orNone(placeholder)"
        :required="required"
        option-label="label"
        option-value="value"
        @filter="(e)=>$emit('filter', e)"
      />
      <p-dropdown
        v-else
        v-model="input"
        :aria-describedby="elseNone(visible.message, id.message)"
        :aria-errormessage="elseNone(visible.label && invalid, id.label)"
        :aria-invalid="orNone(invalid)"
        :aria-label="orNone(label || labelTranslated)"
        :aria-labelledby="elseNone(visible.label, id.label)"
        :aria-required="orNone(required)"
        :class="{
          [$style.input]: true,
          ['invalid']: invalid,
        }"
        :disabled="disabled"
        :filter="!noFilter"
        :input-id="id.input"
        :name="name"
        :options="options"
        :placeholder="orNone(placeholder)"
        :required="required"
        option-label="label"
        option-value="value"
      />
      <template #placeholder>
        <select
          v-model="input"
          :aria-describedby="elseNone(visible.message, id.message)"
          :aria-errormessage="elseNone(visible.label && invalid, id.label)"
          :aria-invalid="orNone(invalid)"
          :aria-label="orNone(label || labelTranslated)"
          :aria-labelledby="elseNone(visible.label, id.label)"
          :aria-required="orNone(required)"
          :class="$style.fallbackSelect"
          :disabled="disabled"
          :multiple="isMultiple"
          :name="name"
          :required="required"
        >
          <option
            v-for="option in options"
            :key="`${option.value}$${option.label}`"
            :selected="orNone(option.value === input)"
            :value="option.value"
            v-text="option.label"
          />
        </select>
      </template>
    </LazyClientOnly>
    <transition name="input-message">
      <small
        v-if="visible.message"
        :id="id.message"
        :class="$style.message"
      >
        <slot
          name="message"
        />
      </small>
    </transition>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineAsyncComponent,
    defineComponent,
    reactive,
    ref,
    unref,
  } from "vue";
  import type {
    MultiSelectFilterEvent,
  } from "primevue/multiselect";
  import {
    elseNone, orNone, type AppOptionsProp,
  } from "./helpers";
  import useModelWrapper from "~/composables/useModelWrapper";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  import TranslatedText from "~/components/TranslatedText.vue";

  export type FilterEvent = MultiSelectFilterEvent;

  export default defineComponent({
    components: {
      TranslatedText,
      PDropdown: defineAsyncComponent(() => import("primevue/dropdown")),
      PMultiSelect: defineAsyncComponent(() => import("primevue/multiselect")),
    },

    props: {
      modelValue: {
        required: false,
        type: [ String, Array ],
        default: () => "",
      },

      name: {
        required: true,
        type: String,
      },

      required: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      noColon: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      label: {
        required: false,
        type: String,
        default: () => "",
      },

      labelKey: {
        required: false,
        type: String,
        default: () => "",
      },

      invalid: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      disabled: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      placeholder: {
        required: false,
        type: String,
        default: () => "",
      },

      noFilter: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      multiple: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      options: {
        required: true,
        type: Array as AppOptionsProp,
      },
    },

    emits: {
      "update:modelValue": () => true,
      filter: (e: FilterEvent) => true,
    },

    setup(props, { emit }) {
      const uniqueId = useId().replace(":", "_");
      const slotExists = useReactiveSlots("message", "label");

      const input = useModelWrapper(props, emit)("modelValue");

      const inputId = computed(() => `input-${ uniqueId }-${ props.name }`);

      return {
        input,
        id: reactive({
          input: inputId,
          message: computed(() => `${ unref(inputId) }--message`),
          label: computed(() => `${ unref(inputId) }--label`),
        }),
        visible: reactive({
          label: computed(() => Boolean(props.label || props.labelKey || slotExists.label.value)),
          message: computed(() => slotExists.message.value),
        }),
        labelTranslated: ref(""),
        elseNone,
        orNone,
        isMultiple: computed(() => props.multiple || Array.isArray(props.modelValue)),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @use "sass:map";
  @import "assets/styles/include";

  .container {
    position: relative;
    display: inline-block;

    &:global([aria-disabled="true"]) {
      opacity: .5;
    }

    .label {
      font-weight: bold;
      display: inline-block;
      margin-bottom: .75em;
      cursor: pointer;
      color: #{color.adjust($fer-black, $alpha: -.2)};

      &.withColon {

        &::after {
          content: ":";
        }
      }

      &.required {

        &::before {
          font-weight: bold;
          content: "*";
          color: $fer-error;
        }
      }
    }

    .input {
      @extend %input-template;

      padding: 0;

      :global(.p-dropdown-label) {
        padding: .625em;
      }
    }

    .fallbackSelect {
      @extend %input-template;

      position: relative;
      display: flex;
      background-color: $fer-white;
    }

    $message-margin: .25em;

    .message {
      font-size: 80%;
      display: block;
      margin-top: $message-margin;
      transition-property: opacity, transform, color;
      opacity: .75;
      color: $fer-black;
    }

    .input.invalid + .message {
      opacity: 1;
      color: $fer-error;
    }

    :global {

      .input-message {

        &-enter-active,
        &-leave-active {
          transform: translateY(0);
        }

        &-enter-active {
          transition-duration: .1s;
        }

        &-enter-from,
        &-leave-to {
          transform: translateY(calc(-1 * #{$message-margin}));
          opacity: 0;
        }
      }
    }
  }
</style>
