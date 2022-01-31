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
    <input
      :id="id.input"
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
      :maxlength="elseNull(maxlength >= 0, maxlength)"
      :minlength="elseNull(minlength >= 0, minlength)"
      :name="name"
      :placeholder="orNull(placeholder)"
      :required="required"
      :type="type"
    >
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
    },

    props: {
      modelValue: {
        required: false,
        type: [ String, Number ],
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

      type: {
        required: false,
        type: String,
        default: () => "text",
      },

      placeholder: {
        required: false,
        type: String,
        default: () => "",
      },

      minlength: {
        required: false,
        type: Number,
        default: () => -1,
      },

      maxlength: {
        required: false,
        type: Number,
        default: () => -1,
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
      margin-bottom: .75rem;
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
      font-size: 1rem;
      width: 100%;
      padding: .625rem;
      transition-property: outline-color, border-color;
      color: $fer-black;
      border: 1px solid #{color.adjust($fer-black, $alpha: -.6)};
      border-radius: 4px;
      outline: transparent solid 2px;
      appearance: none;

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

    $message-margin: .25rem;

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
