<template>
  <div
    ref="dropdown$"
    :class="{
      [$style.main]: true,
      [$style.modeHover]: menu.hover,
      [$style.directionTop]: menu.direction === 'top',
      [$style.directionRight]: menu.direction === 'right',
      [$style.directionBottom]: menu.direction === 'bottom',
      [$style.directionLeft]: menu.direction === 'left',
    }"
  >
    <div
      :class="$style.triggerContainer"
    >
      <div
        :class="$style.trigger"
        @click.prevent="!menu.hover && toggle()"
        @mouseover.prevent="menu.hover && show()"
        @mouseleave.prevent="menu.hover && hide()"
      >
        <slot
          name="trigger"
        />
      </div>

      <transition :name="menu.transition">
        <div
          v-if="menu.isOpen"
          :class="{
            [$style.contents]: true,
            [$style.withArrow]: menu.withArrow,
          }"
          :style="{
            'z-index': menu.containerZIndex,
            '--arrow-color': menu.arrowColor,
            '--arrow-offset': menu.arrowOffset,
          }"
          @mouseover.prevent="menu.hover && show()"
          @mouseleave.prevent="menu.hover && hide()"
        >
          <slot name="contents" />
        </div>
      </transition>
    </div>

    <div
      v-if="menu.overlay && !menu.dontCloseOnClickOutside && !menu.hover && menu.isOpen"
      :class="$style.overlay"
      :style="{
        'background-color': menu.overlayBgColor,
        'z-index': menu.overlayZIndex,
      }"
      @mousedown.prevent="hide"
    />
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    reactive,
    ref,
    toRef,
    toRefs,
    watch,
  } from "vue";
  import {
    unrefElement,
  } from "@vueuse/core";

  let zIndex = 90;

  export default defineComponent({
    name: "DropdownMenu",

    props: {
      isOpen: {
        type: Boolean,
        required: false,
        default: false,
      },
      direction: {
        type: String,
        required: false,
        default: "left",
      },
      dontCloseOnClickOutside: {
        type: Boolean,
        required: false,
        default: false,
      },
      withDropdownCloser: {
        type: Boolean,
        required: false,
        default: false,
      },
      overlay: {
        type: Boolean,
        required: false,
        default: false,
      },
      overlayBgColor: {
        type: String,
        required: false,
        default: "rgba(0, 0, 0, 0.2)",
      },
      overlayZIndex: {
        type: String,
        required: false,
        default: (zIndex++).toString(),
      },
      containerZIndex: {
        type: String,
        required: false,
        default: (zIndex++).toString(),
      },
      transition: {
        type: String,
        required: false,
        default: "default",
      },
      withArrow: {
        type: Boolean,
        required: false,
        default: false,
      },
      arrowColor: {
        type: String,
        required: false,
        default: "transparent",
      },
      arrowOffset: {
        type: String,
        required: false,
        default: "0.8rem",
      },
      hover: {
        type: Boolean,
        required: false,
        default: false,
      },
    },

    setup(props, { emit }) {
      const menu = reactive({
        ...toRefs(props),
        isOpen: props.isOpen,
      });
      const dropdown$ = ref();

      watch(toRef(props, "isOpen"), (value) => {
        menu.isOpen = value;
      });

      watch(toRef(menu, "isOpen"), (value) => {
        if (menu.hover) {
          return;
        }

        if (value) {
          emit("update:isOpen", value);
        } else {
          emit("update:isOpen", value);
        }
      });

      function dropdownCloser() {
        if (!menu.withDropdownCloser) {
          return;
        }

        unrefElement(dropdown$)
          ?.querySelectorAll("[dropdown-closer]")
          .forEach((element) => {
            element.addEventListener("click", () => {
              menu.isOpen = false;
            });
          })
        ;
      }

      function closeDropdownOnClickOutside(e: Event) {
        if (!menu.isOpen) {
          return;
        }

        if (!unrefElement(dropdown$)?.contains(e.target as Node)) {
          menu.isOpen = false;
        }
      }

      function closeDropdownOnPopState() {
        window && window.addEventListener("popstate", () => {
          if (!menu.isOpen) {
            return;
          }

          menu.isOpen = false;
        });
      }

      onMounted(async () => {
        dropdownCloser();
        closeDropdownOnPopState();
        await nextTick();
        if (!menu.dontCloseOnClickOutside) {
          if (window) {
            window.addEventListener("click", closeDropdownOnClickOutside);
          }
        }
      });

      onBeforeUnmount(() => {
        if (window) {
          if (!menu.dontCloseOnClickOutside) {
            window.removeEventListener("click", closeDropdownOnClickOutside);
          }

          window.removeEventListener("popstate", closeDropdownOnPopState);
        }
      });

      return {
        dropdown$,
        menu,
        show() {
          menu.isOpen = true;
        },
        hide() {
          menu.isOpen = false;
        },
        toggle() {
          menu.isOpen = !menu.isOpen;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .main {
    // Util
    $this: &;

    // Container
    $container-offset: .5rem;
    $border-color: inherit;

    // Arrow
    $arrow-size: $container-offset;
    $arrow-color: var(--arrow-color);
    $arrow-offset: var(--arrow-offset);
    $arrow-position-inset: 1px;

    position: relative;
    display: contents;

    .contents {
      position: absolute;
      top: 100%;
      bottom: auto;
      width: 100%;

      > {
        position: relative;

        ::before,
        ::after {
          position: absolute;
          z-index: 1;
          width: 0;
          height: 0;
        }

        ::before {
          border: calc(#{$arrow-size} + #{$arrow-position-inset} + 1px) solid transparent;
        }

        ::after {
          border: calc(#{$arrow-size} + #{$arrow-position-inset}) solid transparent;
        }
      }

      &.withArrow {

        > {

          ::before,
          ::after {
            content: "";
          }
        }
      }
    }

    &.directionTop {

      .contents {
        top: auto;
        bottom: calc(100% + #{$container-offset});

        > {

          ::before,
          ::after {
            top: calc(100% - #{$arrow-position-inset});
            left: 50%;
          }

          ::before {
            transform: translate(-50%, 1px);
            border-top-color: $border-color;
          }

          ::after {
            transform: translateX(-50%);
            border-top-color: $arrow-color;
          }
        }
      }

      :global {

        .default-enter,
        .default-leave-to {
          transform: translateY(-$arrow-offset);
        }
      }
    }

    &.directionRight {

      .contents {
        top: 0;
        left: calc(100% + #{$container-offset});

        > {

          ::before,
          ::after {
            top: $arrow-offset;
            left: 0;
          }

          ::before {
            transform: translate(-100%, calc(-1 * #{$arrow-position-inset}));
            border-right-color: $border-color;
          }

          ::after {
            transform: translateX(calc(-100% + #{$arrow-position-inset}));
            border-right-color: $arrow-color;
          }
        }
      }

      :global {

        .default-enter,
        .default-leave-to {
          transform: translateX($arrow-offset);
        }
      }
    }

    &.directionBottom {

      .contents {
        top: calc(100% + #{$container-offset});
        bottom: auto;

        > {

          ::before,
          ::after {
            top: 0;
            left: 50%;
          }

          ::before {
            transform: translate(calc(-100% + #{$arrow-position-inset}), -100%);
            border-bottom-color: $border-color;
          }

          ::after {
            transform: translate(-100%, -100%);
            border-bottom-color: $arrow-color;
          }
        }
      }

      :global {

        .default-enter,
        .default-leave-to {
          transform: translateY($arrow-offset);
        }
      }
    }

    &.directionLeft {

      .contents {
        top: 0;
        right: calc(100% + #{$container-offset});

        > {

          ::before,
          ::after {
            top: $arrow-offset;
            right: 0;
          }

          ::before {
            transform: translate(100%, calc(-1 * #{$arrow-position-inset}));
            border-left-color: $border-color;
          }

          ::after {
            transform: translateX(calc(100% - #{$arrow-position-inset}));
            border-left-color: $arrow-color;
          }
        }
      }

      :global {

        .default-enter,
        .default-leave-to {
          transform: translateX(-$arrow-offset);
        }
      }
    }

    :global {
      // Default Transition
      .default-enter-active {
        transition: all .3s ease;
      }

      .default-leave-active {
        transition: all .3s cubic-bezier(1, .5, .8, 1);
      }

      .default-enter,
      .default-leave-to {
        opacity: 0;
      }
    }

    &.modeHover {

      :global {

        .default-enter,
        .default-leave-active {
          transition-delay: .4s;
        }
      }
    }

    .triggerContainer {
      position: relative;
      display: contents;
    }

    .trigger {
      position: relative;
      display: contents;
      cursor: pointer;
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
</style>
