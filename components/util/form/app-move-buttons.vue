<template>
  <div :class="$style.moveButtons">
    <p-button
      :disabled="disabled || 0 === index"
      aria-label="Move up"
      class="p-button-secondary p-button-sm p-button-text"
      icon="pi pi-arrow-up"
      type="button"
      @click="$emit('move', index - 1)"
    />
    <p-button
      :disabled="disabled || count - 1 === index"
      aria-label="Move down"
      class="p-button-secondary p-button-sm p-button-text"
      icon="pi pi-arrow-down"
      type="button"
      @click="$emit('move', index + 1)"
    />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";

  export default defineComponent({
    name: "AppMoveButtons",

    props: {
      index: {
        type: Number,
        required: true,
      },

      count: {
        type: Number,
        required: true,
      },

      disabled: {
        type: Boolean,
        default: false,
      },
    },

    emits: {
      move: (to: number) => Number.isInteger(to),
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .moveButtons {
    position: absolute;
    top: -.25rem;
    right: 1rem;
    display: flex;
    transform: translateY(-50%);
    border-radius: 4px;
    background-color: $fer-off-gray;
  }
</style>
