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
    <div :class="$style.inputContainer">
      <label
        v-for="option in options"
        :key="JSON.stringify(option)"
        :class="$style.option"
      >
        <input
          v-model="selected[option.value]"
          :checked="modelValue.includes(option.value)"
          :disabled="disabled"
          :name="name"
          :required="required"
          :value="option.value"
          type="checkbox"
        >
        <translated-text :trans-key="option.label" />
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
  import {
    fromPairs,
    toPairs,
  } from "rambdax";
  import useModelWrapper from "~/composables/useModelWrapper";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    watch,
  } from "#imports";

  export default defineComponent({
    components: {
      TranslatedText,
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

      const selected = reactive(
        fromPairs(
          unref(props.options as { label: string, value: string, }[])
            .map((v) => [ v.value, props.modelValue?.includes(v.value) ?? false ])
          ,
        ),
      );

      watch(
        selected,
        (inputs) => {
          input.value =
            toPairs(inputs)
              .filter(([ , v ]) => v)
              .map(([ x ]) => x)
          ;
        },
      );

      const inputId = computed(() => `input-${ uniqueId }-${ props.name }`);

      function elseNull<T, C>(check: C, value: T) {
        return check ? value : null;
      }

      function orNull<T>(value: T) {
        return elseNull(value, value);
      }

      return {
        input,
        selected,
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

    .inputContainer {
      display: flex;
      flex-direction: column;
      padding: .5em 0;
      gap: .75em;

      .option {
        display: flex;
        align-items: center;
        gap: .5em;
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
