<template>
  <div
    v-if="showRaw"
    :class="$style.rawValue"
    @click="handleToggle"
    v-text="string"
  />
  <div
    v-else
    :class="$style.container"
  >
    <span v-if="'null' === type">null</span>
    <span v-else-if="'undefined' === type">undefined</span>
    <span v-else-if="'boolean' === type" :class="$style.boolean" :data-bool="value.toString()" v-text="value.toString()" />
    <div v-else-if="'array' === type" :class="$style.array">
      <details
        v-for="(item, index) in value"
        :key="index"
        :open="expanded"
      >
        <summary :class="$style.arrayKey" v-text="index" />
        <div :class="$style.arrayElement">
          <AppJsonViewer
            :json="item"
            as-json
            expanded
          />
        </div>
      </details>
    </div>
    <div
      v-else-if="'object' === type"
      :class="$style.object"
    >
      <details
        v-for="(item, key) in value"
        :key="key"
        :open="expanded"
      >
        <summary :class="$style.objectKey" v-text="key" />
        <div :class="$style.objectValue">
          <AppJsonViewer
            :json="item"
            as-json
            expanded
          />
        </div>
      </details>
    </div>
    <span v-else :data-type="type" :title="value" v-text="value" />
  </div>
</template>

<script lang="ts">
  import {
    PropType,
  } from "vue";
  import {
    ref,
    unref,
    computed,
    defineComponent,
  } from "#imports";

  const typeOf = <T, >(value: T) => {
    if (null === value) {
      return "null";
    }

    if (undefined === value) {
      return "undefined";
    }

    // if (Array.isArray(value)) {
    //   return "array";
    // }

    return typeof value;
  };

  export default defineComponent({
    name: "AppJsonViewer",

    props: {
      json: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: [ Object, Array, Number, String, Boolean, null, undefined ] as PropType<any>,
        required: true,
      },

      jsonIsRaw: {
        type: Boolean,
        default: () => false,
        required: false,
      },

      jsonString: {
        type: [ String, undefined ] as PropType<string | undefined>,
        default: () => undefined,
        required: false,
      },

      asJson: {
        type: Boolean,
        default: () => false,
        required: false,
      },

      expanded: {
        type: Boolean,
        default: () => false,
        required: false,
      },
    },

    setup(props) {
      const string = computed(
        () => {
          if (props.jsonIsRaw) {
            return String(props.json);
          }

          if (undefined !== props.jsonString) {
            return props.jsonString;
          }

          if (props.asJson) {
            return "";
          }

          return JSON.stringify(props.json);
        }
        ,
      );

      const value = computed(
        () => {
          if (props.jsonIsRaw) {
            return JSON.parse(props.json as string);
          }

          return props.json as unknown;
        },
      );

      const type = computed(() => typeOf(unref(value)));
      const showRaw = ref(!props.asJson);

      return {
        type,
        value,
        string,
        showRaw,
        handleToggle() {
          showRaw.value = !showRaw.value;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    line-height: 1.1em;
  }

  .rawValue {
    font-family: monospace;
    line-height: 1.1em;
    overflow: hidden;
    cursor: zoom-in;
    white-space: pre;
    text-overflow: ellipsis;
  }

  .boolean {
    line-height: 1.25em;
    padding: 0 .25em;
    border-radius: 4px;

    &[data-bool="true"] {
      color: white;
      background-color: $fer-success;
    }

    &[data-bool="false"] {
      color: white;
      background-color: color.adjust($fer-error, $blackness: 25%);
    }
  }

  .array {
    display: flex;
    flex-direction: column;
    counter-reset: section;

    /*
    &::before {
      content: "[";
    }

    &::after {
      content: "]";
    }
    */
  }

  .arrayKey {
    font-style: italic;
  }

  .object {
    display: flex;
    flex-direction: column;

    /*
    &::before {
      content: "{";
    }

    &::after {
      content: "}";
    }
    */

    > * {
      line-height: 1.5;
    }
  }

  .objectKey {
    font-weight: bold;
    font-style: italic;
  }

  .object details[open] .objectKey::after {
    content: ":";
  }

  .object details:not([open]) .objectKey::after {
    content: ":\25BC";
  }

  .objectValue,
  .arrayElement {
    padding-left: 2ch;
    border-left: 2px solid rgb(0 0 0 / 25%);
  }

  details {

    &[open] {

      > .objectKey,
      > .arrayKey {
        cursor: zoom-out;
      }
    }

    &:not([open]) {

      > .objectKey,
      > .arrayKey {
        cursor: zoom-in;
      }
    }

    > .objectKey,
    > .arrayKey {
      display: inline-block;
    }
  }
</style>
