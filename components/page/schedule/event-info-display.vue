<template>
  <app-img
    v-if="info?.icon"
    :alt="String(info.type)"
    :class="$style.icon"
    :src="info.icon"
    aspect-ratio="1"
    contain
  />
  <span
    v-if="info?.text"
    :class="$style.text"
    v-text="info.text"
  />
</template>

<script lang="ts" setup>
  import AppImg from "~/components/util/app-img.vue";
  import {
    type EventInfo,
    type TCalendarEvent,
    useEventInfo,
  } from "~/composables/calendar/useEventInfo";
  import {
    computed,
    unref,
  } from "#imports";

  type Props = {
    event?: TCalendarEvent,
    info?: EventInfo,
  };
  const props = defineProps<Props>();

  const info = computed(() => {
    if (props.info) {
      return props.info;
    }

    if (props.event) {
      return unref(useEventInfo(props.event));
    }
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .icon {
    display: inline-block;
    flex: inherit;
    width: 1.3125rem;
  }

  .text {
    opacity: .7;
    color: $fer-dark-blue;
  }
</style>
