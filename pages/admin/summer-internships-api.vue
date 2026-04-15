<template>
  <AppMaxWidthContainer>
    <h1>
      Ljetne prakse API
    </h1>

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

    <div v-if="data" class="mt-3">
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tbody>
          <tr>
            <td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">
              URL
            </td>
            <td style="padding: 4px 0; word-break: break-all;">
              {{ data.url ?? 'N/A' }}
            </td>
          </tr>
          <tr>
            <td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">
              Timestamp
            </td>
            <td style="padding: 4px 0;">
              {{ data.timestamp ?? 'N/A' }}
            </td>
          </tr>
          <tr v-if="data.response">
            <td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">
              Status
            </td>
            <td style="padding: 4px 0;">
              {{ (data.response as DebugResponse).status }} {{ (data.response as DebugResponse).statusText }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="data.error" class="mt-3">
        <h3 style="color: red;">
          Error
        </h3>
        <pre style="white-space: pre-wrap; word-break: break-word; color: red;">{{ formatJson(data.error) }}</pre>
      </div>

      <div v-if="data.response" class="mt-3">
        <h3>
          Response Data
        </h3>
        <pre style="white-space: pre-wrap; word-break: break-word;">{{ formatJson((data.response as DebugResponse).data) }}</pre>
      </div>
    </div>

    <pre v-if="fetchError" class="mt-3" style="white-space: pre-wrap; word-break: break-word; color: red;">{{ fetchError }}</pre>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import {
    ref,
    useRuntimeConfig,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";

  type DebugResponse = {
    status: number,
    statusText: string,
    data: unknown,
  };

  useTitle("Ljetne prakse API", false);

  const config = useRuntimeConfig();
  const sessionId = unref(useCookie("jobfair-session"));

  const loading = ref(false);
  const data = ref<Record<string, unknown> | null>(null);
  const fetchError = ref<string | null>(null);

  function formatJson(value: unknown): string {
    if ("string" === typeof value) {
      return value;
    }
    return JSON.stringify(value, null, 2);
  }

  async function fetchData() {
    loading.value = true;
    fetchError.value = null;
    data.value = null;

    try {
      const res = await $fetch<{ data: Record<string, unknown>, }>(`${ config.public.API_BASE }/summer-internships/`, {
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId ?? "",
        },
      });
      data.value = res.data;
    } catch (e: unknown) {
      fetchError.value = e instanceof Error ? `${ e.message }\n\n${ e.stack }` : String(e);
    } finally {
      loading.value = false;
    }
  }
</script>
