<template>
  <div
    :aria-disabled="orNull(disabled)"
    :class="[$style.container, $attrs.class]"
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

    <LazyClientOnly>
      <template #fallback>
        <div
          key="fallback"
          :class="[$style.editor, $style.editorLoading, $style.newsStyles]"
          contenteditable="true"
          @change="$emit('update:modelValue', $event.target.innerHTML)"
          v-html="modelValue"
        />
      </template>
      <div
        :class="{
          [$style.editor]: true,
          ['invalid']: invalid,
        }"
      >
        <div :class="$style.editorActions">
          <div :class="$style.editorActionGroup">
            <button
              :data-active="editor.isActive('heading', { level: 1 })"
              title="Heading (Ctrl + Alt + 1)"
              type="button"
              @click="handleEditorAction('heading', 1)"
            >
              <IconHeading1 />
            </button>
            <button
              :data-active="editor.isActive('heading', { level: 2 })"
              title="Heading (Ctrl + Alt + 2)"
              type="button"
              @click="handleEditorAction('heading', 2)"
            >
              <IconHeading2 />
            </button>
            <button
              :data-active="editor.isActive('heading', { level: 3 })"
              title="Heading (Ctrl + Alt + 2)"
              type="button"
              @click="handleEditorAction('heading', 3)"
            >
              <IconHeading3 />
            </button>
          </div>
          <div :class="$style.editorActionGroup">
            <button
              :data-active="editor.isActive('bold')"
              title="Bold (Ctrl + B)"
              type="button"
              @click="handleEditorAction('bold')"
            >
              <IconBold />
            </button>
            <button
              :data-active="editor.isActive('italic')"
              title="Italic (Ctrl + I)"
              type="button"
              @click="handleEditorAction('italic')"
            >
              <IconItalic />
            </button>
            <button
              :data-active="editor.isActive('underline')"
              title="Underline (Ctrl + U)"
              type="button"
              @click="handleEditorAction('underline')"
            >
              <IconUnderline />
            </button>
          </div>
          <div :class="$style.editorActionGroup">
            <button
              :data-active="editor.isActive('link')"
              title="Insert link"
              type="button"
              @click="handleEditorAction('insertLink')"
            >
              <IconLink />
            </button>
            <button
              :disabled="!editor.isActive('link')"
              title="Remove link"
              type="button"
              @click="handleEditorAction('removeLink')"
            >
              <IconLinkRemove />
            </button>
          </div>
          <div :class="$style.editorActionGroup">
            <button
              title="New line"
              type="button"
              @click="handleEditorAction('newLine')"
            >
              <IconParagraphBreak />
            </button>
            <button
              title="Clear formatting"
              type="button"
              @click="handleEditorAction('clearFormatting')"
            >
              <IconClearFormatting />
            </button>
          </div>
          <div :class="$style.editorActionGroup">
            <button
              :disabled="!editor.can().undo()"
              title="Undo"
              type="button"
              @click="handleEditorAction('undo')"
            >
              <IconUndo />
            </button>
            <button
              :disabled="!editor.can().redo()"
              title="Redo"
              type="button"
              @click="handleEditorAction('redo')"
            >
              <IconRedo />
            </button>
          </div>
        </div>
        <EditorContent
          :class="[$style.editorContent, $style.newsStyles]"
          :editor="editor"
        />
      </div>
    </LazyClientOnly>

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

<script lang="ts" setup>
  import {
    EditorContent,
    useEditor,
  } from "@tiptap/vue-3";
  import {
    computed,
    reactive,
    unref,
  } from "vue";
  import {
    Link,
  } from "@tiptap/extension-link";
  import {
    Bold,
  } from "@tiptap/extension-bold";
  import {
    Italic,
  } from "@tiptap/extension-italic";
  import {
    Underline,
  } from "@tiptap/extension-underline";
  import {
    Text,
  } from "@tiptap/extension-text";
  import {
    Document,
  } from "@tiptap/extension-document";
  import {
    Paragraph,
  } from "@tiptap/extension-paragraph";
  import {
    HardBreak,
  } from "@tiptap/extension-hard-break";
  import {
    History,
  } from "@tiptap/extension-history";
  import {
    Typography,
  } from "@tiptap/extension-typography";
  import type {
    Level,
  } from "@tiptap/extension-heading";
  import {
    Heading,
  } from "@tiptap/extension-heading";
  import {
    ref,
    watch,
  } from "#imports";
  import IconHeading1 from "~icons/ci/heading-h1";
  import IconHeading2 from "~icons/ci/heading-h2";
  import IconHeading3 from "~icons/ci/heading-h3";
  import IconUnderline from "~icons/ant-design/underline-outlined";
  import IconItalic from "~icons/ant-design/italic-outlined";
  import IconBold from "~icons/ant-design/bold-outlined";
  import IconParagraphBreak from "~icons/ci/line-break";
  import IconLink from "~icons/mdi/link-variant";
  import IconLinkRemove from "~icons/mdi/link-variant-off";
  import IconClearFormatting from "~icons/ic/baseline-format-clear";
  import IconUndo from "~icons/carbon/undo";
  import IconRedo from "~icons/carbon/redo";
  import useModelWrapper from "~/composables/useModelWrapper";
  import useReactiveSlots from "~/composables/useReactiveSlots";
  import {
    try$,
  } from "~/helpers/data";

  const props = defineProps({
    modelValue: {
      required: false,
      type: String,
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
  });

  const emit = defineEmits([
    "update:modelValue",
  ]);

  const uniqueId = Math.random().toString(36).substring(2);
  const slotExists = useReactiveSlots("message", "label");

  const input = useModelWrapper(props, emit)("modelValue");

  const editor = useEditor({
    extensions: [
      Text,
      Document,
      Paragraph,
      Typography,
      HardBreak,
      Heading.configure({
        levels: [ 1, 2, 3 ],
      }),
      History,
      Bold,
      Italic,
      Underline,
      Link.configure({
        autolink: false,
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
        },
      }),
    ],
    content: unref(input),
    onUpdate: ({ editor }) => {
      input.value = editor.getHTML();
    },
  });
  watch(
    input,
    (value) => {
      const $editor = editor.value;

      if (!$editor) {
        return;
      }

      const isSame = value === $editor.getHTML();

      if (isSame) {
        return;
      }

      $editor.commands.setContent(value, false);
    },
  );

  const inputId = computed(() => `input-${ uniqueId }-${ props.name }`);

  const id = reactive({
    input: inputId,
    message: computed(() => `${ unref(inputId) }--message`),
    label: computed(() => `${ unref(inputId) }--label`),
  });

  const visible = reactive({
    label: computed(() => Boolean(props.label || props.labelKey || slotExists.label.value)),
    message: computed(() => slotExists.message.value),
  });

  function elseNull<T, C>(check: C, value: T) {
    return check ? value : null;
  }

  function orNull<T>(value: T) {
    return elseNull(value, value);
  }

  type EditorAction = never
    | { name: "heading", args: [ Level | 0 ], }
    | { name: "bold", }
    | { name: "italic", }
    | { name: "underline", }
    | { name: "newLine", }
    | { name: "insertLink", }
    | { name: "removeLink", }
    | { name: "clearLink", }
    | { name: "clearFormatting", }
    | { name: "undo", }
    | { name: "redo", }
  ;

  type ActionArgs_<TAction extends EditorAction> = TAction extends { args: infer A, } ? A : never[];
  type ActionArgs<TName extends EditorAction["name"]> = ActionArgs_<Extract<EditorAction, { name: TName, }>>;

  function handleEditorAction<TName extends EditorAction["name"]>(event: TName, ...args: ActionArgs<TName>) {
    const $editor = editor.value;

    if (!$editor) {
      return;
    }

    switch (event) {
      case "heading": {
        const [
          level,
        ] = args;

        if (!level) {
          return;
        }

        $editor.chain().focus().toggleHeading({ level }).run();
        return;
      }

      case "bold": {
        $editor.chain().focus().toggleBold().run();
        return;
      }

      case "italic": {
        $editor.chain().focus().toggleItalic().run();
        return;
      }

      case "underline": {
        $editor.chain().focus().toggleUnderline().run();
        return;
      }

      case "newLine": {
        $editor.chain().focus().setHardBreak().run();
        return;
      }

      case "clearLink": {
        $editor.chain().focus().unsetLink().run();
        return;
      }

      case "insertLink": {
        const currentLink = $editor.getAttributes("link")?.href as string | null;

        const href = window.prompt("URL", currentLink ?? "") ?? "";
        const parsedHref = try$(() => new URL(href));
        if (!parsedHref) {
          return;
        }

        const target =
          window.location.host !== parsedHref.host
            ? "_blank"
            : "_self"
        ;

        $editor.chain().focus().toggleLink({
          href,
          target,
        }).run();

        return;
      }

      case "removeLink": {
        $editor.chain().focus().unsetLink().run();
        return;
      }

      case "clearFormatting": {
        $editor.chain().focus().clearNodes().unsetAllMarks().run();
        return;
      }

      case "undo": {
        $editor.chain().focus().undo().run();
        return;
      }

      case "redo": {
        $editor.chain().focus().redo().run();
        return;
      }
    }

    console.warn(`Unknown editor action: ${ event }`);
  }

  const labelTranslated = ref("");
</script>

<style lang="scss" module>
  @use "sass:color";
  @use "sass:map";
  @import "assets/styles/include";
  @import "assets/styles/page/news";

  .container {
    position: relative;
    display: inline-block;

    &:global([aria-disabled="true"]) {
      opacity: .5;
    }

    .newsStyles {
      @extend %news-styles;
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

    .editor {
      @extend %input-template;

      padding: 0;

      &.editorLoading {
        padding: .5em;
      }

      .editorActions {
        font-size: 1.25em;
        position: sticky;
        z-index: 3;
        top: $nav-height;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: .5rem;
        user-select: none;
        vertical-align: middle;
        border-bottom: 1px solid #{map.get($input-colors, "border")};
        background-color: #{color.mix($fer-white, $fer-black, 97.5%)};
        gap: 1em;

        .large {
          font-size: 2em;
        }

        .medium {
          font-size: 1.5em;
        }

        .editorActionGroup {
          display: flex;
          vertical-align: middle;
          gap: .1em;

          > button {
            $size: 1.5em;

            display: flex;
            width: $size;
            height: $size;
            padding: .2em;
            cursor: pointer;
            vertical-align: middle;
            opacity: .65;
            color: $fer-black;
            border: none;
            border-radius: 4px;
            background: transparent;
            appearance: none;

            &[data-active="true"] {
              opacity: 1;
              color: $fer-white;
              background-color: $fer-dark-blue;
            }

            &:disabled {
              cursor: default;
              opacity: .25;
            }

            &:not(:disabled):hover {
              opacity: 1;
            }

            > svg {
              width: 100%;
              height: 100%;
            }
          }
        }
      }

      .editorContent {
        display: contents;

        :global(.ProseMirror) {
          padding: .5em;
          border-radius: 0;
          outline: none;
        }
      }
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
