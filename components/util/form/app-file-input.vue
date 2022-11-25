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
    <label
      :class="{
        [$style.dropArea]: true,
        [$style.dragover]: isDragOver,
        [$style.invalid]: invalid,
      }"
      :for="id.input"
      @dragover.prevent="() => false"
      @dragenter.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver= false"
      @drop.prevent="handleDrop"
    >
      <span
        v-if="previewSrc"
        :class="$style.dropAreaPreview"
      >
        <LazyClientOnly>
          <template #fallback>
            <icon-file-generic
              :aria-label="previewName"
            />
          </template>

          <icon-file-generic
            v-if="previewSrc === 'file'"
            :aria-label="previewName"
          />
          <icon-file-archive
            v-else-if="previewSrc === 'archive'"
            :aria-label="previewName"
          />
          <app-img
            v-else
            :alt="previewName || 'Preview'"
            :src="previewSrc"
            aspect-ratio="1.78"
            contain
            @load="freeFileUrl(previewSrc)"
          />
        </LazyClientOnly>
        <span
          v-if="previewName"
          :class="$style.dropAreaPreviewText"
          v-text="previewName"
        />
      </span>
      <span
        v-else
        :class="$style.dropAreaLabel"
      >
        <icon-upload
          :class="$style.dropAreaIcon"
        />
        <translated-text trans-key="form.file.uploadFile" />
      </span>
      <span
        v-if="visible.clearButton"
        :class="[ $style.actionButton, $style.clearButton]"
        @click.prevent.capture="clearInput"
      >
        <i class="pi pi-times" />
      </span>
      <a
        v-if="'string' === typeof modelValue && modelValue"
        :class="[ $style.actionButton, $style.downloadButton]"
        :href="modelValue"
        download
      >
        <i class="pi pi-download" />
      </a>
    </label>
    <input
      :id="id.input"
      :accept="Array.isArray(accept) ? accept.join(',') : accept"
      :aria-describedby="elseNull(visible.message, id.message)"
      :aria-errormessage="elseNull(visible.label && invalid, id.label)"
      :aria-invalid="orNull(invalid)"
      :aria-label="orNull(label || labelTranslated)"
      :aria-labelledby="elseNull(visible.label, id.label)"
      :aria-required="orNull(required)"
      :class="{
        [$style.input]: true,
        [$style.invalid]: invalid,
      }"
      :disabled="disabled"
      :multiple="multiple"
      :name="name"
      :placeholder="orNull(placeholder)"
      :required="orNull(required && !previewSrc)"
      type="file"
      @change="handleChange"
    >
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
    watch,
  } from "vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  // noinspection TypeScriptCheckImport
  import IconUpload from "~icons/ep/upload";
  // noinspection TypeScriptCheckImport
  import IconFileGeneric from "~icons/ant-design/file-outlined";
  // noinspection TypeScriptCheckImport
  import IconFileArchive from "~icons/ant-design/file-zip-outlined";
  import AppImg from "~/components/util/app-img.vue";
  import useModelWrapper from "~/composables/useModelWrapper";

  const zipMimeTypes = new Set([
    "application/zip",
    "application/gzip",
    "application/x-7z-compressed",
  ]);

  export default defineComponent({
    components: {
      AppImg,
      TranslatedText,
      IconUpload,
      IconFileGeneric,
      IconFileArchive,
    },

    props: {
      // eslint-disable-next-line vue/require-prop-types
      modelValue: {
        required: false,
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

      accept: {
        required: false,
        type: [ String, Array ],
        default: () => "",
      },

      fileName: {
        required: false,
        type: String,
        default: () => "",
      },

      fileType: {
        required: false,
        type: String,
        default: () => "",
      },

      multiple: {
        required: false,
        type: Boolean,
        default: () => false,
      },

      clearable: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    emits: [ "update:modelValue" ],

    setup(props, { emit }) {
      const uniqueId = Math.random().toString(36).substring(2);
      const slotExists = useReactiveSlots("message", "label");
      const previewImg$ = ref(null as (HTMLInputElement | null));

      const watchProp = useModelWrapper(props, emit);
      const [
        fileName,
        fileType,
        modelValue,
      ] = [
        watchProp("fileName"),
        watchProp("fileType"),
        watchProp<"modelValue", string | FileList | File | null | undefined>("modelValue"),
      ] as const;
      const inputId = computed(() => `input-${ uniqueId }-${ props.name }`);

      function elseNull<T, C>(check: C, value: T) {
        return check ? value : null;
      }

      function orNull<T>(value: T) {
        return elseNull(value, value);
      }

      const isDragOver = ref(false);

      const previewSrc = ref("");
      const previewName = ref("");
      const setPreviewSrc = (name: string, mimetype: string, file: File | string) => {
        clearPreviewSrc();

        previewName.value = name;

        const supportsImageType = (type: string) => {
          try {
            return document.createElement("canvas").toDataURL(type).startsWith(`data:${ type }`);
          } catch {
            return false;
          }
        };

        if (supportsImageType(mimetype.toLowerCase())) {
          previewSrc.value =
            "object" === typeof file
              ? URL.createObjectURL(file)
              : file
          ;
        } else if (zipMimeTypes.has(mimetype.toLowerCase())) {
          previewSrc.value = "archive";
        } else {
          previewSrc.value = "file";
        }
      };

      const freeFileUrl = (url: string) => {
        try {
          URL.revokeObjectURL(unref(url));
        } catch {
        }
      };

      const clearPreviewSrc = () => {
        freeFileUrl(previewSrc.value);
        previewSrc.value = "";
        previewName.value = "";
      };

      watch(
        [
          fileType,
          fileName,
          modelValue,
        ],
        () => {
          const [
            name,
            type,
            value,
          ] = [
            unref(fileName),
            unref(fileType),
            unref(modelValue),
          ] as const;

          if (!("string" === typeof value)) {
            return;
          }

          if (!value) {
            return clearPreviewSrc();
          }

          if (type && name) {
            setPreviewSrc(name, type, value);
          }
        },
        {
          immediate: true,
        },
      );

      const handleInputChange = (files?: FileList | null) => {
        if (!files || 0 === files.length) {
          clearPreviewSrc();
        }

        const [ file ] = files || [];
        if (file) {
          setPreviewSrc(file.name, file.type, file);
        }

        if (props.multiple) {
          modelValue.value = files;
        } else {
          modelValue.value = file;
        }
      };

      return {
        previewImg$,
        id: reactive({
          input: inputId,
          message: computed(() => `${ unref(inputId) }--message`),
          label: computed(() => `${ unref(inputId) }--label`),
        }),
        visible: reactive({
          label: computed(() => Boolean(props.label || props.labelKey || slotExists.label.value)),
          message: computed(() => slotExists.message.value),
          clearButton: computed(() => props.clearable && (Array.isArray(unref(modelValue)) ? 0 < (unref(modelValue) as unknown as unknown[]).length : Boolean(unref(modelValue)))),
        }),
        labelTranslated: ref(""),
        elseNull,
        orNull,
        isDragOver,
        previewSrc,
        previewName: computed(() => unref(previewName) || props.fileName),
        freeFileUrl,
        handleChange(event: Event) {
          handleInputChange((event.target as HTMLInputElement)?.files);

          return false;
        },
        handleDrop(event: DragEvent) {
          isDragOver.value = false;
          handleInputChange(event.dataTransfer?.files);

          return false;
        },
        clearInput() {
          handleInputChange(null);

          return false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @use "sass:math";
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

    .dropArea {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 11em;
      padding: .625em;
      transition-property: outline-color, border-color;
      color: $fer-black;
      border: 1px solid #{color.adjust($fer-black, $alpha: -.6)};
      border-radius: 4px;
      outline: transparent solid 2px;
      appearance: none;

      @include media(md) {
        height: 115px;
      }

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

      &.dragover,
      &:hover {
        border-style: dashed;

        .dropAreaIcon {
          transform: translateY(-10%);
        }
      }

      .dropAreaLabel {
        font-size: .875em;
        font-weight: 600;
        z-index: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding: .5em;
        user-select: none;
        pointer-events: none;
        color: #{color.adjust($fer-black, $alpha: -.4)};
        border-radius: 4px;
        background-color: #{color.adjust($fer-white, $alpha: -.5)};
      }

      .dropAreaPreview {
        display: flex;
        align-items: center;
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        height: 100%;
        color: #{color.adjust($fer-black, $alpha: -.4)};
        gap: .25em;

        > *:first-child {
          flex: 1;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .dropAreaPreviewText {
          line-height: 1;
          display: inline-block;
          overflow: hidden;
          max-width: 16em;
          min-height: 1.2em;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }

      .dropAreaIcon {
        $size: 2em;

        width: $size;
        height: $size;
        margin-bottom: .25em;
        transition-timing-function: $transition-bounce-function;
        transition-duration: .5s;
        transition-property: transform;
        transform: none;
      }

      .actionButton {
        position: absolute;
        display: flex;
        padding: .75em;
        transition-property: background-color;
        color: $fer-black;
        border-radius: 100%;
        background-color: transparent;

        &:hover {
          background-color: #{color.adjust($fer-black, $alpha: -.9125)};
        }

        > i {
          margin-right: -1px;
          margin-bottom: -1px;
        }
      }

      .clearButton {
        top: .5em;
        right: .5em;
      }

      .downloadButton {
        $font-size: 1.25em;

        font-size: $font-size;
        bottom: calc(#{math.div(.5em, $font-size)} * 1em);
        left: calc(#{math.div(.5em, $font-size)} * 1em);
      }
    }

    .input {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
      opacity: 0;
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
