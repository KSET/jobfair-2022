<template>
  <div
    v-if="hasAspectRatio"
    ref="imgEl"
    :aria-label="alt"
    :class="{
      [$style.aspectContainer]: true,
      [$style.isPreview]: isPreview,
    }"
    role="img"
  >
    <div
      :style="`padding-bottom: ${ aspectRatioRounded * 100 }%;`"
    />
    <div
      :class="[
        $style.image,
        contain
          ? $style.contain
          : $style.cover
        ,
      ]"
      :style="{ backgroundImage: imgSrc }"
    />
  </div>
  <img
    v-else
    :alt="alt"
    :class="$style.imgContainer"
    :src="imgSrc"
    loading="lazy"
  >
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
    toRefs,
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

      img.addEventListener("load", async () => {
        try {
          await img.decode();
        } catch {
        }

        resolve(url);
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
    ) {
      const props = toRefs(propValues);

      const isVisible = ref(false);
      const imgEl = ref<HTMLElement | null>(null);
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
      }

      const aspectRatio = computed(() => {
        const ratio = props.aspectRatio.value;

        if (
          "number" === typeof ratio ||
          !ratio?.includes("/")
        ) {
          return 1 / Number(ratio);
        }

        const [ a, b ] = ratio?.split("/").map(Number);

        return b / a;
      });

      const aspectRatioRounded = computed(() => Math.round(aspectRatio.value * 1_000) / 1_000);

      const isPreview = ref(null !== props.lazySrc.value);
      const imgSrc = ref(props.lazySrc.value || props.src.value);

      until(isVisible)
        .toBeTruthy()
        .then(() => preloadImage(props.src.value))
        .then((src) => {
          imgSrc.value = src;
          isPreview.value = false;
        })
        .catch(() => null)
      ;

      const hasAspectRatio = computed(() => 0 < aspectRatio.value);

      return {
        aspectRatioRounded,
        imgSrc,
        hasAspectRatio,
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

    .image {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transition-timing-function: $transition-timing-function;
      transition-duration: .5s;
      transition-property: background, background-image, filter;
      background-repeat: no-repeat;
      background-position: center center;
      will-change: background-image;

      &.contain {
        background-size: contain;
      }

      &.cover {
        background-size: cover;
      }
    }

    &.isPreview {

      .image {
        filter: blur($blur-radius);
      }
    }
  }

  .imgContainer {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }
</style>
