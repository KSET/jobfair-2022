<template>
  <div
    :class="{
      [$style.container]: true,
      [$style.open]: isOpen,
    }"
    @focusin="setFocus('in')"
    @focusout="setFocus('out')"
    @keydown.esc="setFocus('out')"
  >
    <AppInput
      v-model="searchInput"
      :class="$style.input"
      :disabled="disabled"
      :invalid="invalid"
      :label="label"
      :label-key="labelKey"
      :loading="isLoading"
      :name="name"
      :no-colon="noColon"
      :placeholder="placeholder"
      :required="required ?? true"
      aria-autocomplete="none"
      autocomplete="off"
      type="autocomplete"
    />
    <div
      :class="$style.dropdown"
    >
      <ul
        ref="suggestions$"
        role="listbox"
      >
        <li
          v-for="(suggestion, i) in suggestions"
          :key="suggestion"
          :data-index="i"
          role="option"
          tabindex="0"
          @click="$emit('item-select', suggestion)"
          @keydown.space.prevent="$emit('item-select', suggestion)"
          @keydown.enter.prevent="$emit('item-select', suggestion)"
          @keydown.tab="shouldAllowTabKeypress($event, i)"
          v-text="suggestion"
        />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
  import type {
    PropType,
  } from "vue";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    ref,
    useDebounceFn,
    computed,
    watch,
    defineComponent,
    nextTick,
  } from "#imports";
  import useModelWrapper from "~/composables/useModelWrapper";

  export default defineComponent({
    components: {
      AppInput,
    },

    props: {
      modelValue: {
        required: false,
        type: String,
        default: () => "",
      },

      name: {
        required: true,
        type: String,
      },

      suggestions: {
        required: true,
        type: Array as PropType<string[]>,
      },

      loading: {
        required: false,
        type: Boolean,
        default: () => false,
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

      placeholder: {
        required: false,
        type: String,
        default: () => "",
      },

      disabled: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    emits: [
      "complete",
      "item-select",
      "update:modelValue",
    ],

    setup(props, { emit }) {
      const isOpen = ref(false);
      const isLoading = ref(false);
      const searchInput = useModelWrapper(props, emit)("modelValue");

      const suggestions$ = ref<HTMLUListElement | null>(null);

      watch(searchInput, (val) => {
        emit("complete", val);
      });

      watch(isOpen, (val, oldVal) => {
        // If state changed from closed to open, emit the complete event
        if (val && !oldVal) {
          void nextTick(() => {
            const $suggestions = suggestions$.value;
            if ($suggestions) {
              $suggestions.parentElement!.scrollTop = 0;
            }
          });

          emit("complete", searchInput.value);
        }
      });

      return {
        suggestions$,
        isOpen,
        isLoading: computed(() => props.loading || isLoading.value),
        searchInput,
        setFocus: useDebounceFn((state: "in" | "out") => {
          isOpen.value = "in" === state;
        }, 100),
        shouldAllowTabKeypress(event: KeyboardEvent, iSuggestion: number) {
          const iSuggestionLast = props.suggestions.length - 1;
          const isLastSuggestion = iSuggestionLast === iSuggestion;
          const isFirstSuggestion = 0 === iSuggestion;
          const hasShiftPressed = event.shiftKey;

          const isTryingToTabAfterLastSuggestion = isLastSuggestion && !hasShiftPressed;
          const isTryingToTabBeforeFirstSuggestion = isFirstSuggestion && hasShiftPressed;
          const isTryingToTabOutsideSuggestions = isTryingToTabAfterLastSuggestion || isTryingToTabBeforeFirstSuggestion;

          if (!isTryingToTabOutsideSuggestions) {
            return true;
          }

          const targetIndex =
            isLastSuggestion
              ? 0
              : iSuggestionLast
          ;
          const $suggestions = suggestions$.value;
          const $suggestion = $suggestions?.querySelector<HTMLElement>(`[data-index="${ targetIndex }"]`);

          $suggestion?.focus();
          event.preventDefault();
          return false;
        },
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
    display: flex;
    align-items: stretch;
    flex-direction: column;

    &.open {

      input {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    .dropdown {
      position: absolute;
      z-index: 3;
      top: 100%;
      right: 0;
      left: 0;
      overflow: auto;
      max-height: 200px;
      margin-top: -1px;
      border: 1px solid #{map.get($input-colors, "border")};
      border-radius: 0 0 4px 4px;
      background-color: white;
      box-shadow: #{map.get($shadows, "shadow-4")};

      > ul {
        margin: 0;
        padding: 0;
        list-style: none;

        > li {
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 1em;
          cursor: pointer;
          white-space: nowrap;
          border: none;
          border-radius: 0;
          outline-color: $fer-yellow;

          &:hover {
            background-color: rgb(0 0 0 / 10%);
          }

          &:focus {
            background-color: #{color.adjust($fer-yellow, $alpha: -.95)};
          }
        }
      }
    }

    &:not(.open) .dropdown {
      display: none;
    }
  }
</style>
