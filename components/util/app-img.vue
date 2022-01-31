<template>
  <div
    :class="{
      [$style.aspectContainer]: true,
      [$style.isPreview]: isPreview,
    }"
  >
    <div
      :class="$style.responsiveSizer"
      :style="{
        paddingBottom: `${ aspectRatioRounded * 100 }%`,
      }"
      aria-hidden="true"
    />
    <picture :class="$style.imgElContainer">
      <slot
        name="sources"
      />

      <img
        ref="imgEl"
        :alt="alt"
        :class="[
          $style.image,
          contain
            ? $style.contain
            : $style.cover
          ,
        ]"
        :src="imgSrc"
        aria-hidden="true"
        draggable="false"
        loading="lazy"
      >
    </picture>
    <div
      v-if="$slots.default"
      :class="$style.contentContainer"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    ref,
    toRefs,
    unref,
    watch,
  } from "vue";
  import {
    until,
    useIntersectionObserver,
  } from "@vueuse/core";
  import {
    always,
  } from "rambda";

  type Props = {
    aspectRatio: string | number,
    src: string,
    lazySrc: string | null,
    alt: string,
    contain: boolean,
  };

  function preloadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.addEventListener("load", () => {
        // eslint-disable-next-line no-void
        void img
          .decode()
          .then(() => resolve(url))
          .catch()
        ;
      });
      img.addEventListener("error", reject);

      img.src = url;
    });
  }

  export default defineComponent({
    name: "AppImg",

    props: {
      aspectRatio: {
        required: false,
        type: [ Number, String ],
        default: always(Infinity),
      },

      src: {
        required: true,
        type: String,
      },

      lazySrc: {
        required: false,
        type: String,
        default: always(null),
      },

      alt: {
        required: true,
        type: String,
      },

      contain: {
        required: false,
        type: Boolean,
        default: always(false),
      },
    },

    setup(
      propValues: Props,
      {
        emit,
      },
    ) {
      const props = toRefs(propValues);

      const imgEl = ref<HTMLImageElement | null>(null);

      const isVisible = ref(false);
      const isPreview = ref(Boolean(unref(props.lazySrc)));
      const imgSrc = ref(props.lazySrc.value || props.src.value);
      const actualAspectRatio = ref(0.5);

      watch(props.src, (val) => {
        imgSrc.value = val;
      });

      function calculateActualAspectRatio() {
        if (null === imgEl.value) {
          actualAspectRatio.value = 0.5;
          return;
        }

        if (0 === imgEl.value.naturalHeight) {
          actualAspectRatio.value = 0.5;
          return;
        }

        actualAspectRatio.value = imgEl.value.naturalWidth / imgEl.value.naturalHeight;
      }

      onMounted(() => {
        calculateActualAspectRatio();
        imgEl.value?.addEventListener("load", () => {
          emit("load", unref(imgEl)?.src);
          calculateActualAspectRatio();
        });
      });

      if (props.lazySrc.value) {
        const { stop } = useIntersectionObserver(
          imgEl,
          ([ { isIntersecting } ]) => {
            if (isIntersecting) {
              stop();
              isVisible.value = isIntersecting;
            }
          },
        );

        until(isVisible)
          .toBeTruthy()
          .then(() => preloadImage(props.src.value))
          .then((src) => {
            imgSrc.value = src;
            isPreview.value = false;
          })
          .catch(() => null)
        ;
      }

      const aspectRatio = computed(() => {
        const ratio = props.aspectRatio.value;

        if (ratio === Infinity) {
          return actualAspectRatio.value;
        }

        if (
          "number" === typeof ratio ||
          !ratio?.includes("/")
        ) {
          return 1 / Number(ratio);
        }

        const [ a, b ] = ratio?.split("/").map(Number);

        return b / a;
      });

      return {
        aspectRatioRounded: computed(() => Math.round(aspectRatio.value * 1_000) / 1_000),
        imgSrc,
        hasAspectRatio: computed(() => 0 < aspectRatio.value),
        imgEl,
        isPreview,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:math";
  @import "assets/styles/include/all";

  $blur-radius: 8px;

  .aspectContainer {
    position: relative;
    display: flex;
    overflow: hidden;
    flex: 1 0 auto;
    max-width: 100%;
    max-height: 100%;

    &.isPreview {

      .image {
        filter: blur($blur-radius);
      }
    }
  }

  .responsiveSizer {
    flex: 1 0 0;
    transition-property: padding-bottom;
  }

  .imgElContainer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
  }

  .image {
    width: 100%;
    height: 100%;
    transition-duration: .5s;
    transition-property: filter;
    will-change: filter;
    object-position: 50% 50%;

    &.contain {
      object-fit: contain;
    }

    &.cover {
      object-fit: cover;
    }
  }

  .contentContainer {
    position: absolute;
    right: 2.125rem;
    bottom: 2.125rem;
    padding: 1.15rem;
    border-radius: 10px;
    background: rgba($fer-white, .85);
    backdrop-filter: blur(10px);

    &:empty {
      display: none;
    }
  }
</style>
