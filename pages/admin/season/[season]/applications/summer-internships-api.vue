<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1>
      Ljetne prakse API
    </h1>

    <div>
      <NuxtLink :to="{ name: 'admin-season-season-applications', params: $route.params }">
        &larr; Natrag
      </NuxtLink>
    </div>

    <div class="mt-5">
      <h2>Ljetne prakse u sezoni ({{ internships.length }})</h2>

      <p v-if="internshipsError" style="color: red;">
        {{ internshipsError }}
      </p>

      <DataTable
        v-model:expandedRows="expandedRows"
        :value="internships"
        data-key="uid"
        row-hover
        responsive-layout="scroll"
      >
        <Column :expander="true" header-style="width: 3rem" />
        <Column field="externalCompany" header="Firma" sortable>
          <template #body="{ data }">
            {{ data.company?.brandName ?? data.externalCompany ?? '—' }}
          </template>
        </Column>
        <Column field="position" header="Pozicija" sortable />
        <Column field="workingPeriodStart" header="Od" sortable>
          <template #body="{ data }">
            {{ new Date(data.workingPeriodStart).toLocaleDateString() }}
          </template>
        </Column>
        <Column field="workingPeriodEnd" header="Do" sortable>
          <template #body="{ data }">
            {{ new Date(data.workingPeriodEnd).toLocaleDateString() }}
          </template>
        </Column>
        <Column field="places" header="Mjesta" sortable>
          <template #body="{ data }">
            {{ data.places ?? '—' }}
          </template>
        </Column>
        <Column field="signed" header="Potpisano" sortable>
          <template #body="{ data }">
            {{ data.signed ? 'Da' : 'Ne' }}
          </template>
        </Column>
        <template #expansion="{ data }">
          <div :class="$style.expansion">
            <div :class="$style.expansionRow">
              <strong>Opis:</strong>
              <div v-html="data.description" />
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <div class="mt-5">
      <h2>Dohvati podatke s API-ja</h2>

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
          <AppJsonViewer :json="data.error" as-json />
        </div>

        <div v-if="data.response" class="mt-3">
          <h3>
            Response Data
          </h3>
          <AppJsonViewer :json="(data.response as DebugResponse).data" as-json />
        </div>
      </div>

      <pre v-if="fetchError" class="mt-3" style="white-space: pre-wrap; word-break: break-word; color: red;">{{ fetchError }}</pre>
    </div>

    <div class="mt-5">
      <h2>Sinkronizacija</h2>

      <div class="mt-3">
        <p-button
          :loading="syncLoading"
          label="Sinkroniziraj"
          @click="handleSync"
        />
      </div>

      <div v-if="syncResult" class="mt-3">
        <template v-for="section in syncResultSections" :key="section.label">
          <p>{{ section.label }}: {{ section.companies.length > 0 ? section.companies.length : '-' }}</p>
          <ul v-if="section.companies.length > 0">
            <li v-for="name in section.companies" :key="name">
              {{ name }}
            </li>
          </ul>
        </template>
      </div>

      <pre v-if="syncError" class="mt-3" style="white-space: pre-wrap; word-break: break-word; color: red;">{{ syncError }}</pre>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import {
    computed,
    ref,
    useRuntimeConfig,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppJsonViewer from "~/components/util/app-json-viewer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    graphql,
  } from "~/graphql/client";
  import type {
    SyncResult,
  } from "~/graphql/client/graphql";

  type DebugResponse = {
    status: number,
    statusText: string,
    data: unknown,
  };

  useTitle("Ljetne prakse API", false);

  const internshipsQuery = useQuery({
    query: graphql(/* GraphQL */`
      query PageAdminSummerInternshipsApi_Data {
        internships {
          uid
          position
          description
          workingPeriodStart
          workingPeriodEnd
          places
          signed
          externalCompany
        }
      }
    `),
  });

  const internshipsRes = await internshipsQuery();
  const internships = ref(internshipsRes?.data?.internships ?? []);
  const internshipsError = ref(internshipsRes?.error?.message ?? null);
  const expandedRows = ref<Record<string, boolean>>({});

  async function refreshInternships() {
    const res = await internshipsQuery();
    internships.value = res?.data?.internships ?? [];
    internshipsError.value = res?.error?.message ?? null;
  }

  const config = useRuntimeConfig();
  const sessionId = unref(useCookie("jobfair-session"));

  const loading = ref(false);
  const data = ref<Record<string, unknown> | null>(null);
  const fetchError = ref<string | null>(null);

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

  const syncLoading = ref(false);
  const syncResult = ref<SyncResult | null>(null);
  const syncError = ref<string | null>(null);

  const syncResultSections = computed(() => {
    if (!syncResult.value) {
      return [];
    }
    return [
      { label: "Kreirano", companies: syncResult.value.createdCompanies },
      { label: "Ažurirano", companies: syncResult.value.updatedCompanies },
      { label: "Obrisano", companies: syncResult.value.deletedCompanies },
      { label: "Neusklađeno", companies: syncResult.value.unmatched },
    ];
  });

  const route = useRoute();

  const syncSummerInternshipsMutation = useMutation(graphql(/* GraphQL */`
    mutation SyncSummerInternships($season: String!) {
      syncSummerInternships(season: $season) {
        createdCompanies
        updatedCompanies
        deletedCompanies
        unmatched
      }
    }
  `));

  async function handleSync() {
    syncLoading.value = true;
    syncResult.value = null;
    syncError.value = null;

    try {
      const res = await syncSummerInternshipsMutation({ season: route.params.season as string });

      if (res?.error) {
        syncError.value = res.error.message;
        return;
      }

      if (!res?.data?.syncSummerInternships) {
        syncError.value = "Nešto je pošlo po krivu. Pokušajte ponovo.";
        return;
      }

      syncResult.value = res.data.syncSummerInternships;
      // fire-and-forget — table refresh doesn't block the sync result display
      refreshInternships().catch(console.error);
    } catch (e: unknown) {
      syncError.value = e instanceof Error ? `${ e.message }\n\n${ e.stack }` : String(e);
    } finally {
      syncLoading.value = false;
    }
  }
</script>

<style lang="scss" module>
  .expansion {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
  }

  .expansionRow {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;

    > strong {
      min-width: 60px;
      color: #666;
    }
  }
</style>
