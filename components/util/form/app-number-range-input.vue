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
    <div :class="$style.slider">
      <label
        v-for="item in range"
        :key="item"
        :class="$style.inputLabel"
      >
        <span v-text="item" />
        <input
          :id="`${id.input}-${item}`"
          v-model.number="input"
          :aria-describedby="elseNull(visible.message, id.message)"
          :aria-errormessage="elseNull(visible.label && invalid, id.label)"
          :aria-invalid="orNull(invalid)"
          :aria-label="orNull(label || labelTranslated)"
          :aria-required="orNull(required)"
          :class="{
            [$style.input]: true,
            [$style.invalid]: invalid,
          }"
          :disabled="disabled"
          :name="name"
          :required="required"
          :value="item"
          type="radio"
        >
      </label>
    </div>
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
        type: Number,
        default: () => 0,
      },

      name: {
        required: true,
        type: String,
      },

      min: {
        required: true,
        type: Number,
      },

      max: {
        required: true,
        type: Number,
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
    },

    emits: [ "update:modelValue" ],

    setup(props, { emit }) {
      const uniqueId = Math.random().toString(36).substring(2);
      const slotExists = useReactiveSlots("message", "label");

      const input = useModelWrapper(props, emit)("modelValue");
      const min = useModelWrapper(props, emit)("min");
      const max = useModelWrapper(props, emit)("max");

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
        range: computed(() => Array.from({ length: unref(max) - unref(min) + 1 }, (_, i) => i + unref(min))),
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

    .slider {
      display: grid;
      justify-content: space-between;
      width: 100%;
      gap: 1em;
      grid-template-columns: repeat(10, minmax(0, 1fr));

      @include media(lg) {
        gap: 0;
      }
    }

    .inputLabel {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      padding: 0 1em;
      cursor: pointer;
      gap: .5em;

      span {
        padding: 0 .2em;
      }
    }

    .input {
      flex: 1 0 auto;

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
