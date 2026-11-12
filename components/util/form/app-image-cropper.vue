<template>
  <p-dialog
    :closable="!isBusy"
    :close-on-escape="!isBusy"
    :draggable="false"
    :visible="Boolean(file)"
    :class="$style.dialog"
    modal
    @update:visible="(v: boolean) => !v && handleCancel()"
  >
    <template #header>
      <strong>
        <translated-text trans-key="form.file.crop.title" />
      </strong>
    </template>

    <div :class="$style.body">
      <div
        ref="viewport$"
        :class="{
          [$style.viewport]: true,
          [$style.dragging]: pointers.size > 0,
        }"
        :style="{ '--crop-pad': `${ CIRCLE_PADDING }px` }"
        tabindex="0"
        @keydown="handleKeydown"
        @lostpointercapture="handlePointerUp"
        @pointercancel="handlePointerUp"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @wheel.prevent="handleWheel"
      >
        <img
          v-if="src"
          ref="img$"
          :class="$style.image"
          :src="src"
          :style="imageStyle"
          alt=""
          draggable="false"
          @error="handleImageError"
          @load="handleImageLoad"
        >
        <span
          :class="$style.mask"
          aria-hidden="true"
        />
        <i
          v-if="!isReady"
          :class="[ $style.spinner, 'pi pi-spin pi-spinner' ]"
        />
      </div>

      <div :class="$style.zoom">
        <icon-zoom-out
          :class="$style.zoomIcon"
          aria-hidden="true"
        />
        <span
          :id="zoomLabelId"
          :class="$style.srOnly"
        >
          <translated-text trans-key="form.file.crop.zoom" />
        </span>
        <p-slider
          v-model="zoomModel"
          :aria-labelledby="zoomLabelId"
          :class="$style.zoomSlider"
          :disabled="!isReady || isBusy"
          :max="MAX_ZOOM"
          :min="1"
          :step="0.01"
        />
        <icon-zoom-in
          :class="$style.zoomIcon"
          aria-hidden="true"
        />
      </div>

      <small
        v-if="hasError"
        :class="$style.error"
        role="alert"
      >
        <translated-text trans-key="form.file.crop.failed" />
      </small>
    </div>

    <template #footer>
      <p-button
        :disabled="isBusy"
        class="p-button-text p-button-secondary"
        @click.prevent="handleCancel"
      >
        <translated-text trans-key="form.file.crop.cancel" />
      </p-button>
      <p-button
        :disabled="!isReady"
        :loading="isBusy"
        class="p-button-secondary font-bold"
        @click.prevent="handleConfirm"
      >
        <translated-text trans-key="form.file.crop.confirm" />
      </p-button>
    </template>
  </p-dialog>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onBeforeUnmount,
    reactive,
    ref,
    shallowRef,
    watch,
    type PropType,
  } from "vue";
  import {
    useResizeObserver,
  } from "@vueuse/core";
  import {
    clamp,
  } from "rambda";
  import Dialog from "primevue/dialog";
  import Slider from "primevue/slider";
  import Button from "primevue/button";
  import TranslatedText from "~/components/TranslatedText.vue";
  import type {
    ImageCrop,
    ImageCropResult,
  } from "~/helpers/forms/image-crop";
  // noinspection TypeScriptCheckImport
  import IconZoomIn from "~icons/ep/zoom-in";
  // noinspection TypeScriptCheckImport
  import IconZoomOut from "~icons/ep/zoom-out";

  const MAX_ZOOM = 4;
  const CIRCLE_PADDING = 16;
  const WHEEL_SENSITIVITY = 0.0015;
  const KEYBOARD_PAN_STEP = 10;
  const KEYBOARD_ZOOM_STEP = 1.1;
  const JPEG_QUALITY = 0.92;
  const MAX_DOWNSCALE_STEPS = 3;

  type Point = { x: number, y: number, };

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas encoding failed"))),
        type,
        quality,
      );
    })
  ;

  const renderSquare = (
    img: HTMLImageElement,
    sx: number,
    sy: number,
    side: number,
    size: number,
  ) => {
    const makeCanvas = (px: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = px;
      canvas.height = px;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas 2D context unavailable");
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      return [ canvas, ctx ] as const;
    };

    const [ first, firstCtx ] = makeCanvas(clamp(size, size * (2 ** MAX_DOWNSCALE_STEPS), Math.round(side)));
    firstCtx.drawImage(img, sx, sy, side, side, 0, 0, first.width, first.height);

    let canvas = first;
    while (canvas.width > size) {
      const nextSize = Math.max(size, Math.round(canvas.width / 2));
      const [ next, nextCtx ] = makeCanvas(nextSize);
      nextCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, nextSize, nextSize);
      canvas = next;
    }

    return canvas;
  };

  /** Integer crop square, in source pixels, for the current view; always inside the image. */
  const cropSquareFor = (
    { naturalWidth, naturalHeight, zoom, centerX, centerY }: {
      naturalWidth: number,
      naturalHeight: number,
      zoom: number,
      centerX: number,
      centerY: number,
    },
  ): ImageCrop => {
    const shortSide = Math.min(naturalWidth, naturalHeight);
    const size = clamp(1, shortSide, Math.round(shortSide / zoom));

    return {
      x: clamp(0, naturalWidth - size, Math.round(centerX - size / 2)),
      y: clamp(0, naturalHeight - size, Math.round(centerY - size / 2)),
      size,
    };
  };

  let idCounter = 0;

  export default defineComponent({
    components: {
      PDialog: Dialog,
      PSlider: Slider,
      PButton: Button,
      TranslatedText,
      IconZoomIn,
      IconZoomOut,
    },

    props: {
      file: {
        required: false,
        type: Object as PropType<File | null>,
        default: () => null,
      },

      previewSize: {
        required: false,
        type: Number,
        default: () => 256,
      },
    },

    emits: {
      confirm: (result: ImageCropResult) => result.file instanceof File,
      cancel: () => true,
    },

    setup(props, { emit }) {
      const zoomLabelId = `image-cropper-${ idCounter++ }--zoom`;
      const viewport$ = ref<HTMLElement | null>(null);
      const img$ = ref<HTMLImageElement | null>(null);

      const src = ref("");
      const isReady = ref(false);
      const isBusy = ref(false);
      const hasError = ref(false);

      const diameter = ref(0);
      const state = reactive({
        naturalWidth: 0,
        naturalHeight: 0,
        zoom: 1,
        centerX: 0,
        centerY: 0,
      });
      const pointers = shallowRef(new Map<number, Point>());

      const baseSide = computed(() => Math.min(state.naturalWidth, state.naturalHeight));
      const scale = computed(() => (baseSide.value ? (diameter.value * state.zoom) / baseSide.value : 0));

      const clampCenter = () => {
        const half = baseSide.value / (2 * state.zoom);
        state.centerX = clamp(half, state.naturalWidth - half, state.centerX);
        state.centerY = clamp(half, state.naturalHeight - half, state.centerY);
      };

      const pan = (dx: number, dy: number) => {
        if (!scale.value) {
          return;
        }
        state.centerX -= dx / scale.value;
        state.centerY -= dy / scale.value;
        clampCenter();
      };

      const zoomAt = (zoom: number, anchor: Point = { x: 0, y: 0 }) => {
        const oldScale = scale.value;
        if (!oldScale) {
          return;
        }
        const sourceX = state.centerX + anchor.x / oldScale;
        const sourceY = state.centerY + anchor.y / oldScale;
        state.zoom = clamp(1, MAX_ZOOM, zoom);
        state.centerX = sourceX - anchor.x / scale.value;
        state.centerY = sourceY - anchor.y / scale.value;
        clampCenter();
      };

      const relativeToCenter = (clientX: number, clientY: number): Point => {
        const rect = viewport$.value?.getBoundingClientRect();
        if (!rect) {
          return { x: 0, y: 0 };
        }
        return {
          x: clientX - (rect.left + rect.width / 2),
          y: clientY - (rect.top + rect.height / 2),
        };
      };

      useResizeObserver(viewport$, () => {
        const el = viewport$.value;
        diameter.value = el ? Math.max(0, el.clientWidth - 2 * CIRCLE_PADDING) : 0;
      });

      const freeSrc = () => {
        if (src.value) {
          URL.revokeObjectURL(src.value);
        }
        src.value = "";
      };

      watch(
        () => props.file,
        (file) => {
          freeSrc();
          isReady.value = false;
          isBusy.value = false;
          hasError.value = false;
          pointers.value = new Map();
          Object.assign(state, {
            naturalWidth: 0,
            naturalHeight: 0,
            zoom: 1,
            centerX: 0,
            centerY: 0,
          });
          if (file) {
            src.value = URL.createObjectURL(file);
          }
        },
        { immediate: true },
      );

      onBeforeUnmount(freeSrc);

      const handleCancel = () => {
        if (isBusy.value) {
          return;
        }
        emit("cancel");
      };

      return {
        MAX_ZOOM,
        CIRCLE_PADDING,
        zoomLabelId,
        viewport$,
        img$,
        src,
        isReady,
        isBusy,
        hasError,
        pointers,

        imageStyle: computed(() => ({
          width: `${ state.naturalWidth }px`,
          height: `${ state.naturalHeight }px`,
          transform: `translate(${ -state.centerX * scale.value }px, ${ -state.centerY * scale.value }px) scale(${ scale.value })`,
          visibility: isReady.value ? "visible" as const : "hidden" as const,
        })),

        zoomModel: computed({
          get: () => state.zoom,
          set: (value: number | number[]) => zoomAt(Array.isArray(value) ? value[0] : value),
        }),

        handleImageLoad() {
          const img = img$.value;
          if (!img?.naturalWidth || !img.naturalHeight) {
            return;
          }
          state.naturalWidth = img.naturalWidth;
          state.naturalHeight = img.naturalHeight;
          state.zoom = 1;
          state.centerX = img.naturalWidth / 2;
          state.centerY = img.naturalHeight / 2;
          isReady.value = true;
        },

        handleImageError() {
          if (props.file) {
            emit("confirm", { file: props.file, crop: null, preview: props.file } satisfies ImageCropResult);
          }
        },

        handlePointerDown(event: PointerEvent) {
          if (!isReady.value || isBusy.value || ("mouse" === event.pointerType && 0 !== event.button)) {
            return;
          }
          (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
          const next = new Map(pointers.value);
          next.set(event.pointerId, { x: event.clientX, y: event.clientY });
          pointers.value = next;
        },

        handlePointerMove(event: PointerEvent) {
          const map = pointers.value;
          const previous = map.get(event.pointerId);
          if (!previous) {
            return;
          }
          const current = { x: event.clientX, y: event.clientY };

          if (1 === map.size) {
            pan(current.x - previous.x, current.y - previous.y);
          } else if (2 === map.size) {
            const [ other ] = [ ...map.entries() ].filter(([ id ]) => id !== event.pointerId).map(([ , p ]) => p);
            const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
            const newDistance = Math.hypot(current.x - other.x, current.y - other.y);
            const oldMid = { x: (previous.x + other.x) / 2, y: (previous.y + other.y) / 2 };
            const newMid = { x: (current.x + other.x) / 2, y: (current.y + other.y) / 2 };

            if (0 < oldDistance) {
              zoomAt(state.zoom * (newDistance / oldDistance), relativeToCenter(oldMid.x, oldMid.y));
            }
            pan(newMid.x - oldMid.x, newMid.y - oldMid.y);
          }

          map.set(event.pointerId, current);
        },

        handlePointerUp(event: PointerEvent) {
          if (!pointers.value.has(event.pointerId)) {
            return;
          }
          const next = new Map(pointers.value);
          next.delete(event.pointerId);
          pointers.value = next;
        },

        handleWheel(event: WheelEvent) {
          if (!isReady.value || isBusy.value) {
            return;
          }
          const delta = 1 === event.deltaMode ? event.deltaY * 16 : event.deltaY;
          zoomAt(state.zoom * Math.exp(-delta * WHEEL_SENSITIVITY), relativeToCenter(event.clientX, event.clientY));
        },

        handleKeydown(event: KeyboardEvent) {
          if (!isReady.value || isBusy.value) {
            return;
          }
          const actions: Record<string, () => void> = {
            ArrowLeft: () => pan(KEYBOARD_PAN_STEP, 0),
            ArrowRight: () => pan(-KEYBOARD_PAN_STEP, 0),
            ArrowUp: () => pan(0, KEYBOARD_PAN_STEP),
            ArrowDown: () => pan(0, -KEYBOARD_PAN_STEP),
            "+": () => zoomAt(state.zoom * KEYBOARD_ZOOM_STEP),
            "=": () => zoomAt(state.zoom * KEYBOARD_ZOOM_STEP),
            "-": () => zoomAt(state.zoom / KEYBOARD_ZOOM_STEP),
          };
          const action = actions[event.key];
          if (action) {
            event.preventDefault();
            action();
          }
        },

        handleCancel,

        async handleConfirm() {
          const { file } = props;
          const img = img$.value;
          if (!file || !img || !isReady.value || isBusy.value) {
            return;
          }

          isBusy.value = true;
          hasError.value = false;
          try {
            const crop = cropSquareFor(state);
            const canvas = renderSquare(img, crop.x, crop.y, crop.size, Math.min(props.previewSize, crop.size));
            const preview = await canvasToBlob(
              canvas,
              file.type,
              "image/jpeg" === file.type ? JPEG_QUALITY : undefined,
            ).catch(() => canvasToBlob(canvas, "image/png"));

            if (props.file !== file) {
              return;
            }

            emit("confirm", { file, crop, preview } satisfies ImageCropResult);
          } catch (e) {
            console.error(e);
            hasError.value = true;
          } finally {
            isBusy.value = false;
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .dialog {
    width: min(28rem, calc(100vw - 2rem));
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .error {
    color: $fer-error;
  }

  .viewport {
    position: relative;
    overflow: hidden;
    width: 100%;
    cursor: grab;
    user-select: none;
    touch-action: none;
    border-radius: 4px;
    outline: none;
    background-color: #{color.adjust($fer-black, $alpha: -.1)};
    aspect-ratio: 1;

    &:focus-visible {
      box-shadow: 0 0 0 2px $fer-yellow;
    }

    &.dragging {
      cursor: grabbing;
    }
  }

  .image {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    max-height: none;
    pointer-events: none;
    transform-origin: 0 0;
    will-change: transform;
  }

  .mask {
    position: absolute;
    inset: var(--crop-pad);
    pointer-events: none;
    border: 2px solid #{color.adjust($fer-white, $alpha: -.2)};
    border-radius: 50%;
    box-shadow: 0 0 0 9999px #{color.adjust($fer-black, $alpha: -.45)};
  }

  .spinner {
    font-size: 2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: $fer-white;
  }

  .zoom {
    display: flex;
    align-items: center;
    gap: .75rem;
  }

  .zoomIcon {
    flex: none;
    width: 1.25em;
    height: 1.25em;
    color: #{color.adjust($fer-black, $alpha: -.4)};
  }

  .zoomSlider {
    flex: 1;
  }

  .srOnly {
    position: absolute;
    overflow: hidden;
    clip: rect(0 0 0 0);
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    white-space: nowrap;
    border: 0;
  }
</style>
