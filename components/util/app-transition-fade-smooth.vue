<template>
  <component
    :is="type"
    :duration="duration"
    :enter-active-class="$style.enterActive"
    :enter-from-class="$style.enterFrom"
    :leave-active-class="$style.leaveActive"
    :leave-class="$style.leave"
    :leave-to-class="$style.leaveTo"
    :move-class="$style.move"
    :tag="tag"
    v-bind="$attrs"
    v-on="hooks"
  >
    <slot />
  </component>
</template>

<script lang="ts">
  import {
    TransitionGroup,
    Transition,
  } from "vue";
  import {
    defineComponent,
    computed,
  } from "#imports";

  export default defineComponent({
    name: "AppTransitionFadeSmooth",

    inheritAttrs: false,

    props: {
      duration: {
        type: Number,
        required: false,
        default: 300,
      },

      group: {
        type: Boolean,
        required: false,
        default: false,
      },

      tag: {
        type: String,
        required: false,
        default: "div",
      },
    },

    setup(props) {
      const setDuration = (el: HTMLElement) => {
        el.style.setProperty("transition-duration", `${ props.duration }ms`, "important");
      };

      const cleanUpDuration = (el: HTMLElement) => {
        el.style.removeProperty("transition-duration");
      };

      /*
       const setAbsolutePosition = (el: HTMLElement, done: () => void) => {
       if (props.group) {
       el.style.setProperty("position", "absolute", "important");
       }

       setTimeout(done, props.duration);
       };
       */

      const setDimensions = (el: HTMLElement) => {
        el.style.setProperty("width", `${ el.offsetWidth }px`);
        el.style.setProperty("height", `${ el.offsetHeight }px`, "important");
      };

      const hooks = {
        beforeEnter: setDuration,
        afterEnter: cleanUpDuration,
        beforeLeave: (el: HTMLElement) => {
          setDimensions(el);
          setDuration(el);
        },
        afterLeave: cleanUpDuration,
        // leave: setAbsolutePosition,
      };

      return {
        type: computed(
          () =>
            props.group
              ? TransitionGroup
              : Transition
          ,
        ),
        hooks,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .move,
  .enterActive,
  .leaveActive {
    transition-timing-function: #{$transition-timing-function};
    transition-duration: .3s;
    transition-property: all;
    clip-path: inset(0);
  }

  .enterFrom,
  .leaveTo {
    // clip-path: inset(0 100% 0 0);
    transform: scaleX(.01);
    opacity: 0;
  }

  .leave {
    position: absolute;
  }

  /*
  .smooth-list-move,
  .smooth-list-enter-active,
  .smooth-list-leave-active {
    transition: all .3s #{$transition-timing-function};
  }

  .smooth-list-enter-from,
  .smooth-list-leave-to {
    transform: scaleY(.01) translate(30px, 0);
    opacity: 0;
  }

  .smooth-list-leave-active {
    position: absolute;
  }
  */
</style>
