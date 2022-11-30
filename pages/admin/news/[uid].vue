<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
  import {
    createError,
    definePageMeta,
  } from "#imports";
  import {
    useNewsStore,
  } from "~/store/news";

  definePageMeta({
    title: "Redirecting...",
    middleware: [
      async (route) => {
        const newsStore = useNewsStore();
        await newsStore.fetchNewsItemByUid(route.params.uid as string);
      },
      () => {
        const newsStore = useNewsStore();
        const newsItem = newsStore.item;

        if (!newsItem) {
          return createError({
            statusCode: 404,
          });
        }
      },
    ],
  });
</script>
