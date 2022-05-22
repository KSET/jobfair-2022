<template>
  <div
    :aria-disabled="orNull(disabled)"
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
    <client-only>
      <p-multi-select
        v-if="isMultiple"
        v-model="input"
        :aria-describedby="elseNull(visible.message, id.message)"
        :aria-errormessage="elseNull(visible.label && invalid, id.label)"
        :aria-invalid="orNull(invalid)"
        :aria-label="orNull(label || labelTranslated)"
        :aria-labelledby="elseNull(visible.label, id.label)"
        :aria-required="orNull(required)"
        :class="{
          [$style.input]: true,
          [$style.invalid]: invalid,
        }"
        :disabled="disabled"
        :filter="!noFilter"
        :input-id="id.input"
        :name="name"
        :options="options"
        :placeholder="orNull(placeholder)"
        :required="required"
        option-label="label"
        option-value="value"
      />
      <p-dropdown
        v-else
        v-model="input"
        :aria-describedby="elseNull(visible.message, id.message)"
        :aria-errormessage="elseNull(visible.label && invalid, id.label)"
        :aria-invalid="orNull(invalid)"
        :aria-label="orNull(label || labelTranslated)"
        :aria-labelledby="elseNull(visible.label, id.label)"
        :aria-required="orNull(required)"
        :class="{
          [$style.input]: true,
          [$style.invalid]: invalid,
        }"
        :disabled="disabled"
        :filter="!noFilter"
        :input-id="id.input"
        :name="name"
        :options="options"
        :placeholder="orNull(placeholder)"
        :required="required"
        option-label="label"
        option-value="value"
      />
      <template #placeholder>
        <select
          v-model="input"
          :aria-describedby="elseNull(visible.message, id.message)"
          :aria-errormessage="elseNull(visible.label && invalid, id.label)"
          :aria-invalid="orNull(invalid)"
          :aria-label="orNull(label || labelTranslated)"
          :aria-labelledby="elseNull(visible.label, id.label)"
          :aria-required="orNull(required)"
          :class="$style.fallbackSelect"
          :disabled="disabled"
          :multiple="isMultiple"
          :name="name"
          :required="required"
        >
          <option
            v-for="option in options"
            :key="`${option.value}$${option.label}`"
            :selected="orNull(option.value === input)"
            :value="option.value"
            v-text="option.label"
          />
        </select>
      </template>
    </client-only>
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
  import useModelWrapper from "~/composables/useModelWrapper";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  import TranslatedText from "~/components/TranslatedText.vue";

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
        type: Array,
      },
    },

    emits: [ "update:modelValue" ],

    setup(props, { emit }) {
      const uniqueId = Math.random().toString(36).substring(2);
      const slotExists = useReactiveSlots("message", "label");

      const input = useModelWrapper(props, emit)("modelValue");

      const inputId = computed(() => `input-${ uniqueId }-${ props.name }`);

      function elseNull<T, C>(check: C, value: T) {
        return check ? value : null;
      }

      function orNull<T>(value: T) {
        return elseNull(value, value);
      }

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
        elseNull,
        orNull,
        isMultiple: computed(() => props.multiple || Array.isArray(props.modelValue)),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
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
      font-size: 1em;
      width: 100%;
      transition-property: outline-color, border-color;
      color: $fer-black;
      border: 1px solid #{color.adjust($fer-black, $alpha: -.6)};
      border-radius: 4px;
      outline: transparent solid 2px;
      appearance: none;

      :global(.p-dropdown-label) {
        padding: .625em;
      }

      &:focus {
        border-color: #{$fer-yellow};
        outline-color: #{$fer-yellow};
      }

      &.invalid {
        border-color: #{$fer-error};

        &:focus {
          outline-color: #{$fer-error};
        }
      }
    }

    .fallbackSelect {
      font-size: 1em;
      position: relative;
      display: flex;
      width: 100%;
      padding: .625em;
      transition-property: outline-color, border-color;
      color: $fer-black;
      border: 1px solid #{color.adjust($fer-black, $alpha: -.6)};
      border-radius: 4px;
      outline: transparent solid 2px;
      background-color: $fer-white;

      &:focus {
        border-color: #{$fer-yellow};
        outline-color: #{$fer-yellow};
      }

      &.invalid {
        border-color: #{$fer-error};

        &:focus {
          outline-color: #{$fer-error};
        }
      }
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
