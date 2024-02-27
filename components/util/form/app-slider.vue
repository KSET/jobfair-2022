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
    <div :class="$style.slider">
      <Slider
        :id="id.input"
        v-model="input"
        :aria-describedby="elseNone(visible.message, id.message)"
        :aria-errormessage="elseNone(visible.label && invalid, id.label)"
        :aria-invalid="orNone(invalid)"
        :aria-label="orNone(label || labelTranslated)"
        :aria-labelled-by="elseNone(visible.label, id.label)"
        :aria-labelledby="elseNone(visible.label, id.label)"
        :aria-required="orNone(required)"
        :class="{
          [$style.input]: true,
          ['invalid']: invalid,
        }"
        :disabled="disabled"
        :max="max"
        :min="min"
        :name="name"
        :required="required"
        :step="step"
      />
      <input
        v-model="input"
        :class="$style.altInput"
        :disabled="disabled"
        :max="max"
        :min="min"
        :required="required"
        :step="step"
        class="mt-3 ml-auto"
        type="number"
      >
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
  import Slider from "primevue/slider";
  import {
    elseNone, orNone,
  } from "./helpers";
  import useModelWrapper from "~/composables/useModelWrapper";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    components: {
      TranslatedText,
      Slider,
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

      min: {
        required: false,
        type: Number,
        default: () => 0,
      },

      max: {
        required: false,
        type: Number,
        default: () => 10,
      },

      step: {
        required: false,
        type: Number,
        default: () => 1,
      },
    },

    emits: [ "update:modelValue" ],

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
    }

    .slider {
      display: flex;
      flex-direction: column;

      .altInput {
        @extend %input-template;

        width: 4em;
        margin-top: 1.5em;
        margin-left: auto;
        padding: .3em .5em;
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
