<template>
  <AppMaxWidthContainer>
    <h1>Ljetne prakse API</h1>

    <div>
      <NuxtLink to="/admin">
        &larr; Natrag
      </NuxtLink>
    </div>

    <div class="mt-3">
      <p-button
        :loading="loading"
        label="Dohvati podatke"
        @click="fetchData"
      />
    </div>

    <pre v-if="data" class="mt-3" style="white-space: pre-wrap; word-break: break-word;">{{ data }}</pre>

    <pre v-if="error" class="mt-3" style="white-space: pre-wrap; word-break: break-word; color: red;">{{ error }}</pre>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import {
    ref,
    useRuntimeConfig,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";

  useTitle("Ljetne prakse API", false);

  const config = useRuntimeConfig();
  const sessionId = unref(useCookie("jobfair-session"));

  const loading = ref(false);
  const data = ref<unknown>(null);
  const error = ref<string | null>(null);

  async function fetchData() {
    loading.value = true;
    error.value = null;
    data.value = null;

    try {
      data.value = await $fetch(`${ config.public.API_BASE }/summer-internships/`, {
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId ?? "",
        },
      });
    } catch (e: unknown) {
      error.value = e instanceof Error ? `${ e.message }\n\n${ e.stack }` : String(e);
    } finally {
      loading.value = false;
    }
  }
</script>
