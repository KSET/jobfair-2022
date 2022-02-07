<template>
  <label :class="$style.container">
    <input
      v-model="checked"
      type="checkbox"
    >
  </label>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import useModelWrapper from "~/composables/useModelWrapper";

  export default defineComponent({
    props: {
      modelValue: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    emits: [
      "update:modelValue",
    ],

    setup(
      props,
      {
        emit,
      },
    ) {
      const propRefFor = useModelWrapper(props, emit);

      return {
        checked: propRefFor("modelValue"),
      };
    },
  });
</script>

<style lang="scss" module>
  .container {
    line-height: 1.1;
    display: grid;
    grid-template-columns: 1em auto;
    gap: .5em;

    :root {
      --form-control-color: rebeccapurple;
      --form-control-disabled: #959495;
    }

    input[type="checkbox"] {
      /* Add if not using autoprefixer */
      font: inherit;

      /* Remove most all native input styles */
      display: grid;

      /* For iOS < 15 */
      width: 1.15em;

      /* Not removed via appearance */
      height: 1.15em;
      margin: 0;
      transform: translateY(-.075em);
      color: currentcolor;
      border: .15em solid currentcolor;
      border-radius: .15em;
      background-color: var(--form-background);
      appearance: none;
      place-content: center;

      &::before {
        width: .65em;
        height: .65em;
        content: "";
        transition: 120ms transform ease-in-out;
        transform: scale(0);
        transform-origin: bottom left;
        background-color: transparent;
        box-shadow: inset 1em 1em var(--form-control-color);
        clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
      }

      &:checked::before {
        transform: scale(1);
      }

      &:focus {
        outline: max(2px, .15em) solid currentcolor;
        outline-offset: max(2px, .15em);
      }

      &:disabled {
        cursor: not-allowed;
        color: var(--form-control-disabled);

        --form-control-color: var(--form-control-disabled);
      }
    }
  }
</style>
