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
    name: "AppDate",

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
      const dateFormatter = computed(() => new Intl.DateTimeFormat(
        translationsStore.currentLanguageIso,
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        },
      ));

      const formattedTime = computed(() => unref(dateFormatter).format(unref(parsedTime)));

      return {
        parsedTime,
        formattedTime,
      };
    },
  });
</script>
