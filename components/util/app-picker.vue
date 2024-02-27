<template>
  <div
    ref="element$"
    :class="[
      $style.container,
      { [$style.opened]: isOpen,},
    ]"
    :title="label"
  >
    <div
      :aria-controls="optionsId"
      :aria-expanded="String(isOpen)"
      :class="$style.label"
      role="button"
      tabindex="0"
      @click="isOpen = !isOpen"
      @keydown.space.prevent="isOpen = !isOpen"
      @keydown.enter.prevent="isOpen = !isOpen"
    >
      <span v-text="label" />
      <IconCaretDownFilled :class="$style.labelIcon" />
    </div>
    <div
      :id="optionsId"
      :aria-hidden="String(!isOpen)"
      :class="$style.options"
      tabindex="-1"
    >
      <div
        v-for="option in options"
        :key="option.value"
        :class="$style.option"
        role="button"
        tabindex="0"
        @click="$emit('select', option.value); isOpen = false"
      >
        <span
          :class="toClass(option.class)"
          v-text="option.label"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import type {
    PropType,
  } from "vue";
  import {
    defineComponent,
  } from "vue";
  import IconCaretDownFilled from "~icons/ant-design/caret-down-filled";
  import {
    onClickOutside,
    ref,
  } from "#imports";
  import {
    type ClassList,
  } from "~/helpers/type";
  import {
    toClass,
  } from "~/helpers/style";

  type PickerOption = {
    label: string,
    value: string,
    class?: ClassList,
  };

  export default defineComponent({
    components: {
      IconCaretDownFilled,
    },

    props: {
      label: {
        required: true,
        type: String,
      },

      options: {
        required: true,
        type: Array as PropType<PickerOption[]>,
      },
    },

    emits: [ "select" ],

    setup() {
      const uniqueId = useId().replace(":", "_");
      const optionsId = `${ Date.now().toString(36) }-${ uniqueId }`;
      const isOpen = ref(false);
      const element$ = ref<HTMLDivElement | null>(null);

      onClickOutside(element$, () => {
        isOpen.value = false;
      });

      return {
        isOpen,
        optionsId,
        toClass,
        element$,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:math";
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    position: relative;
    vertical-align: middle;

    > [aria-hidden="true"] {
      display: none !important;
    }

    .label {
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;
      cursor: pointer;
      gap: .5em;

      .labelIcon {
        width: 1em;
        height: 1em;
        transition-property: transform;
        transform: rotate(0);
        will-change: transform;
      }
    }

    .options {
      $padding: .75em;

      position: absolute;
      z-index: 3;
      top: 100%;
      left: 0;
      display: flex;
      align-items: stretch;
      flex-direction: column;
      min-width: 100%;
      margin-top: -1px;
      padding: #{$padding} 0;
      border: none;
      border-radius: 4px;
      background-color: $fer-white;
      box-shadow: #{map.get($shadows, "shadow-3")};

      .option {
        padding: #{$padding} #{$padding * 2};
        cursor: pointer;
        text-align: left;
        border: none;
        background-color: transparent;
        appearance: none;

        &:hover {
          background-color: #{color.adjust($fer-dark-blue, $alpha: -.915)};
        }
      }
    }

    &.opened {

      .label {

        .labelIcon {
          transform: rotate(180deg);
        }
      }
    }
  }
</style>
