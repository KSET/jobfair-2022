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

      <p v-if="internshipsError" :class="$style.error">
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
        <template #empty>
          Nema unesenih praksi.
        </template>
      </DataTable>
    </div>

    <div class="mt-5">
      <h2>Dohvati podatke s API-ja</h2>

      <div class="mt-3">
        <p-button
          :loading="debugLoading"
          label="Dohvati podatke"
          @click="fetchData"
        />
      </div>

      <div v-if="debugData" class="mt-3">
        <table :class="$style.debugTable">
          <tbody>
            <tr>
              <td :class="$style.debugTableKey">
                URL
              </td>
              <td :class="[$style.debugTableValue, $style.breakAll]">
                {{ debugData.url ?? 'N/A' }}
              </td>
            </tr>
            <tr>
              <td :class="$style.debugTableKey">
                Timestamp
              </td>
              <td :class="$style.debugTableValue">
                {{ debugData.timestamp ?? 'N/A' }}
              </td>
            </tr>
            <tr v-if="debugData.response">
              <td :class="$style.debugTableKey">
                Status
              </td>
              <td :class="$style.debugTableValue">
                {{ debugData.response.status }} {{ debugData.response.statusText }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="debugData.error" class="mt-3">
          <h3 :class="$style.error">
            Error
          </h3>
          <AppJsonViewer :json="debugData.error" as-json />
        </div>

        <div v-if="debugData.response" class="mt-3">
          <h3>
            Response Data
          </h3>
          <AppJsonViewer :json="debugData.response.data" as-json />
        </div>
      </div>

      <pre v-if="debugError" class="mt-3" :class="[$style.error, $style.preWrap]">{{ debugError }}</pre>
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

      <pre v-if="syncError" class="mt-3" :class="[$style.error, $style.preWrap]">{{ syncError }}</pre>

      <div v-if="syncResult" class="mt-4">
        <h3>Neusklađeno: {{ unmatchedRows.length > 0 ? unmatchedRows.length : '-' }}</h3>

        <DataTable
          v-if="unmatchedRows.length > 0"
          :value="unmatchedRows"
          data-key="rowKey"
          row-hover
          responsive-layout="scroll"
        >
          <Column field="row.externalCompany" header="Firma">
            <template #body="{ data }">
              {{ data.row.externalCompany }}
            </template>
          </Column>
          <Column field="row.position" header="Pozicija">
            <template #body="{ data }">
              {{ data.row.position }}
            </template>
          </Column>
          <Column field="row.workingPeriodStart" header="Od">
            <template #body="{ data }">
              {{ new Date(data.row.workingPeriodStart).toLocaleDateString() }}
            </template>
          </Column>
          <Column field="row.workingPeriodEnd" header="Do">
            <template #body="{ data }">
              {{ new Date(data.row.workingPeriodEnd).toLocaleDateString() }}
            </template>
          </Column>
          <Column field="row.places" header="Mjesta">
            <template #body="{ data }">
              {{ data.row.places ?? '—' }}
            </template>
          </Column>
          <Column field="row.signed" header="Potpisano">
            <template #body="{ data }">
              {{ data.row.signed ? 'Da' : 'Ne' }}
            </template>
          </Column>
          <Column header="Akcija">
            <template #body="{ data }">
              <template v-if="data.status === 'linked'">
                <span role="status" :class="$style.success">
                  <i class="pi pi-check" />
                  Povezano s {{ data.linkedCompanyName }}
                </span>
              </template>
              <template v-else>
                <div :class="$style.linkAction">
                  <Dropdown
                    :model-value="getRowSelected(data.rowKey)"
                    :options="companyApps"
                    filter
                    option-label="label"
                    option-value="value"
                    placeholder="Odaberi firmu"
                    aria-label="Odaberi firmu za povezivanje"
                    :disabled="data.status === 'linking'"
                    :class="$style.companyDropdown"
                    @update:model-value="(value) => setRowSelected(data.rowKey, value)"
                  />
                  <p-button
                    label="Poveži"
                    :loading="data.status === 'linking'"
                    :disabled="data.status === 'linking' || data.selectedCompanyUid === null"
                    @click="handleLink(data.rowKey)"
                  />
                </div>
                <p v-if="data.status === 'error' && data.errorMessage" :class="$style.error">
                  {{ data.errorMessage }}
                </p>
              </template>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Dropdown from "primevue/dropdown";
  import {
    computed,
    createError,
    ref,
    useRoute,
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
    SyncSummerInternshipsMutation,
  } from "~/graphql/client/graphql";

  type UnmatchedRow = SyncSummerInternshipsMutation["syncSummerInternships"]["unmatched"][number];

  type UnmatchedRowState = {
    rowKey: string,
    row: UnmatchedRow,
    selectedCompanyUid: string | null,
    status: "idle" | "linking" | "linked" | "error",
    errorMessage?: string,
    linkedCompanyName?: string,
  };

  type DebugResponse = {
    status: number,
    statusText: string,
    data: unknown,
  };

  type DebugData = {
    url?: string,
    timestamp?: string,
    response?: DebugResponse,
    error?: unknown,
  };

  useTitle("Ljetne prakse API", false);

  const route = useRoute();
  const seasonParam = route.params.season;
  if ("string" !== typeof seasonParam || !seasonParam) {
    throw createError({ statusCode: 404, statusMessage: "Sezona nije pronađena" });
  }
  const seasonUid = seasonParam;

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

  const companyAppsQuery = useQuery({
    query: graphql(/* GraphQL */`
      query PageAdminSummerInternshipsApi_Apps($season: String!) {
        companyApplications(season: $season) {
          forCompany {
            uid
            brandName
            legalName
          }
        }
      }
    `),
    variables: { season: seasonUid },
  });

  type CompanyAppOption = {
    label: string,
    value: string,
  };

  const companyApps = ref<CompanyAppOption[]>([]);

  let loadCompanyAppsToken = 0;
  async function loadCompanyApps() {
    const myToken = ++loadCompanyAppsToken;
    const res = await companyAppsQuery();
    if (myToken !== loadCompanyAppsToken) {
      return;
    }
    const apps = res?.data?.companyApplications ?? [];
    companyApps.value = apps
      .flatMap((app) => {
        const company = app.forCompany;
        if (!company) {
          return [];
        }
        const label = (company.brandName || company.legalName || "—").trim();
        return [ { label, value: company.uid } ];
      })
      .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));
  }

  loadCompanyApps().catch(console.error);

  async function refreshInternships() {
    try {
      const res = await internshipsQuery();
      internships.value = res?.data?.internships ?? [];
      internshipsError.value = res?.error?.message ?? null;
    } catch (e: unknown) {
      internshipsError.value = e instanceof Error ? e.message : String(e);
    }
  }

  const config = useRuntimeConfig();
  const sessionId = unref(useCookie("jobfair-session"));

  const debugLoading = ref(false);
  const debugData = ref<DebugData | null>(null);
  const debugError = ref<string | null>(null);

  async function fetchData() {
    debugLoading.value = true;
    debugError.value = null;
    debugData.value = null;

    try {
      const res = await $fetch<{ data: DebugData, }>(`${ config.public.API_BASE }/summer-internships/`, {
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId ?? "",
        },
      });
      debugData.value = res.data;
    } catch (e: unknown) {
      debugError.value = e instanceof Error ? `${ e.message }\n\n${ e.stack }` : String(e);
    } finally {
      debugLoading.value = false;
    }
  }

  type SyncResult = SyncSummerInternshipsMutation["syncSummerInternships"];

  const syncLoading = ref(false);
  const syncResult = ref<SyncResult | null>(null);
  const syncError = ref<string | null>(null);
  const unmatchedRows = ref<UnmatchedRowState[]>([]);

  const syncResultSections = computed(() => {
    if (!syncResult.value) {
      return [];
    }
    return [
      { label: "Kreirano", companies: syncResult.value.createdCompanies },
      { label: "Ažurirano", companies: syncResult.value.updatedCompanies },
      { label: "Obrisano", companies: syncResult.value.deletedCompanies },
    ];
  });

  const syncSummerInternshipsMutation = useMutation(
    graphql(/* GraphQL */`
      mutation SyncSummerInternships($season: String!) {
        syncSummerInternships(season: $season) {
          createdCompanies
          updatedCompanies
          deletedCompanies
          unmatched {
            externalCompany
            position
            description
            workingPeriodStart
            workingPeriodEnd
            places
            signed
          }
        }
      }
    `),
  );

  const linkUnmatchedInternshipMutation = useMutation(
    graphql(/* GraphQL */`
      mutation LinkUnmatchedInternship($input: LinkUnmatchedInternshipInput!) {
        linkUnmatchedInternship(input: $input) {
          uid
          externalCompany
          position
          workingPeriodStart
          workingPeriodEnd
          places
          signed
          description
        }
      }
    `),
  );

  function makeRowKey(row: UnmatchedRow, index: number) {
    return `${ index }:${ row.externalCompany }:${ row.position }:${ String(row.workingPeriodStart) }:${ String(row.workingPeriodEnd) }`;
  }

  async function handleSync() {
    syncLoading.value = true;
    syncResult.value = null;
    syncError.value = null;
    unmatchedRows.value = [];

    try {
      const res = await syncSummerInternshipsMutation({ season: seasonUid });

      if (res?.error) {
        syncError.value = res.error.message;
        return;
      }

      if (!res?.data?.syncSummerInternships) {
        syncError.value = "Nešto je pošlo po krivu. Pokušajte ponovo.";
        return;
      }

      const synced = res.data.syncSummerInternships;

      syncResult.value = synced;
      unmatchedRows.value = synced.unmatched.map((row, index) => ({
        rowKey: makeRowKey(row, index),
        row,
        selectedCompanyUid: null,
        status: "idle",
      }));

      loadCompanyApps().catch(console.error);

      // fire-and-forget — table refresh doesn't block the sync result display
      void refreshInternships();
    } catch (e: unknown) {
      syncError.value = e instanceof Error ? `${ e.message }\n\n${ e.stack }` : String(e);
    } finally {
      syncLoading.value = false;
    }
  }

  function getRowSelected(rowKey: string): string | null {
    return unmatchedRows.value.find((r) => r.rowKey === rowKey)?.selectedCompanyUid ?? null;
  }

  function setRowSelected(rowKey: string, value: string | null) {
    setRowState(rowKey, { selectedCompanyUid: value });
  }

  function setRowState(rowKey: string, patch: Partial<UnmatchedRowState>) {
    const i = unmatchedRows.value.findIndex((r) => r.rowKey === rowKey);
    if (-1 === i) {
      return;
    }
    unmatchedRows.value[i] = { ...unmatchedRows.value[i], ...patch };
  }

  async function handleLink(rowKey: string) {
    const entry = unmatchedRows.value.find((r) => r.rowKey === rowKey);
    if (!entry || null === entry.selectedCompanyUid) {
      return;
    }
    if ("idle" !== entry.status) {
      return;
    }

    const companyUid = entry.selectedCompanyUid;
    const option = companyApps.value.find((o) => o.value === companyUid);
    const companyDisplayName = option?.label ?? "—";

    setRowState(rowKey, { status: "linking" });

    try {
      const res = await linkUnmatchedInternshipMutation({
        input: {
          externalCompany: entry.row.externalCompany,
          position: entry.row.position,
          description: entry.row.description,
          workingPeriodStart: entry.row.workingPeriodStart,
          workingPeriodEnd: entry.row.workingPeriodEnd,
          places: entry.row.places,
          signed: entry.row.signed,
          companyUid,
          seasonUid,
        },
      });

      if (res?.error) {
        setRowState(rowKey, {
          status: "error",
          errorMessage: res.error.message,
        });
        return;
      }

      if (!res?.data?.linkUnmatchedInternship) {
        setRowState(rowKey, {
          status: "error",
          errorMessage: "Nešto je pošlo po krivu. Pokušajte ponovo.",
        });
        return;
      }

      setRowState(rowKey, {
        status: "linked",
        linkedCompanyName: companyDisplayName,
      });

      void refreshInternships();
    } catch (e: unknown) {
      setRowState(rowKey, {
        status: "error",
        errorMessage: e instanceof Error ? e.message : String(e),
      });
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

  .linkAction {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .companyDropdown {
    min-width: 240px;
  }

  .error {
    margin-top: 4px;
    color: red;
  }

  .success {
    color: green;
    font-weight: bold;

    > i {
      margin-right: 4px;
    }
  }

  .debugTable {
    width: 100%;
    max-width: 600px;
    border-collapse: collapse;
  }

  .debugTableKey {
    padding: 4px 12px 4px 0;
    font-weight: bold;
    vertical-align: top;
  }

  .debugTableValue {
    padding: 4px 0;
  }

  .breakAll {
    word-break: break-all;
  }

  .preWrap {
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
