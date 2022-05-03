<template>
  <time
    :datetime="parsedTime.toISOString()"
    v-text="formattedTime"
  />
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    unref,
    useModelWrapper,
  } from "#imports";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "AppTime",

    props: {
      time: {
        type: [ String, Date ],
        required: true,
      },
    },

    setup(props, { emit }) {
      const translationsStore = useTranslationsStore();

      const time = useModelWrapper(props, emit)("time");
      const parsedTime = computed(() => new Date(unref(time)));
      const currentLocale = computed(() => translationsStore.currentLanguageIso);
      const formattedTime = computed(() => unref(parsedTime).toLocaleString(unref(currentLocale)));

      return {
        parsedTime,
        formattedTime,
      };
    },
  });
</script>
