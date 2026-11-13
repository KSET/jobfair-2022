<template>
  <app-max-width-container>
    <h1>Provjera podataka firmi (VIES)</h1>

    <p>
      Ponovno dohvaća pravni naziv i adresu svih firmi ({{ companies.length }}) preko istog VIES servisa
      koji se koristi pri registraciji. Ništa se ne mijenja automatski.
    </p>

    <div :class="$style.controls">
      <p-button
        :disabled="isBusy || 0 === companies.length"
        :loading="isRunning"
        icon="pi pi-refresh"
        label="Pokreni provjeru"
        @click="runRecheck"
      />

      <p-button
        :disabled="isBusy || 0 === failedCount"
        icon="pi pi-replay"
        :label="`Ponovi neuspjele (${ failedCount })`"
        severity="secondary"
        @click="retryFailed"
      />

      <Dropdown
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        placeholder="Svi statusi"
        show-clear
      />

      <p-button
        :disabled="isBusy || 0 === selectedCount"
        :loading="isApplying"
        icon="pi pi-check"
        :label="`Primijeni sve odabrane (${ selectedCount })`"
        severity="success"
        @click="applySelected"
      />
    </div>

    <div v-if="isRunning || progress.total > 0" :class="$style.progress">
      <ProgressBar :value="progressPercent" />
      <small>{{ progress.done }} / {{ progress.total }}</small>
    </div>

    <div v-if="summary" :class="$style.summary">
      <strong>Provjereno:</strong> {{ summary.checked }}
      &nbsp;|&nbsp;
      <strong>Čeka odluku:</strong> {{ summary.pending }}
      &nbsp;|&nbsp;
      <strong>Primijenjeno:</strong> {{ summary.applied }}
      &nbsp;|&nbsp;
      <strong>Ignorirano:</strong> {{ summary.ignored }}
      &nbsp;|&nbsp;
      <strong>Nije moguće provjeriti:</strong> {{ summary.unverifiable }}
      &nbsp;|&nbsp;
      <strong>Nevaljan VAT:</strong> {{ summary.invalid }}
      &nbsp;|&nbsp;
      <strong>Neuspjelo:</strong> {{ summary.failed }}
      &nbsp;|&nbsp;
      <strong>Bez OIB/VAT:</strong> {{ summary.noIdentifier }}
    </div>

    <DataTable
      :value="filteredRows"
      data-key="uid"
      row-hover
      paginator
      :rows="50"
      responsive-layout="scroll"
    >
      <Column header="Firma" field="brandName" sortable>
        <template #body="{ data }">
          <strong v-text="data.brandName" />
          <br>
          <small v-text="data.vat" />
        </template>
      </Column>
      <Column header="Status" field="status" sortable>
        <template #body="{ data }">
          <Tag :severity="statusSeverity(displayStatus(data))" :value="statusLabel(displayStatus(data))" />
          <div v-if="data.error">
            <small v-text="data.error" />
          </div>
        </template>
      </Column>
      <Column header="Pravni naziv">
        <template #body="{ data }">
          <div v-if="data.legalNameChanged" :class="$style.diff">
            <label :class="$style.diffSelect">
              <Checkbox v-model="data.applyLegalName" :binary="true" :disabled="data.legalNameApplied || data.ignored" />
              {{ data.legalNameApplied ? "Primijenjeno" : "Primijeni" }}
            </label>
            <div :class="data.legalNameApplied ? $style.superseded : $style.old" v-text="data.previousLegalName" />
            <div :class="$style.new" v-text="data.apiLegalName" />
          </div>
          <span v-else v-text="data.storedLegalName" />
        </template>
      </Column>
      <Column header="Adresa">
        <template #body="{ data }">
          <div v-if="data.addressChanged" :class="$style.diff">
            <label :class="$style.diffSelect">
              <Checkbox v-model="data.applyAddress" :binary="true" :disabled="data.addressApplied || data.ignored" />
              {{ data.addressApplied ? "Primijenjeno" : "Primijeni" }}
            </label>
            <div :class="data.addressApplied ? $style.superseded : $style.old" v-text="data.previousAddress" />
            <div :class="$style.new" v-text="data.apiAddress" />
          </div>
          <span v-else v-text="data.storedAddress" />
        </template>
      </Column>
      <Column header-style="width: 12rem">
        <template #body="{ data }">
          <template v-if="'CHANGED' === data.status">
            <div v-if="hasPending(data)" :class="$style.rowActions">
              <small v-if="data.legalNameApplied || data.addressApplied">Djelomično primijenjeno</small>
              <p-button
                :disabled="isBusy || (!data.applyLegalName && !data.applyAddress)"
                label="Primijeni"
                size="small"
                @click="applyRows([ data ])"
              />
              <p-button
                :disabled="isBusy"
                label="Ignoriraj"
                size="small"
                severity="secondary"
                @click="ignoreRow(data)"
              />
            </div>
            <span v-else-if="data.ignored">Ignorirano</span>
            <span v-else>Primijenjeno</span>
          </template>
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Dropdown from "primevue/dropdown";
  import Checkbox from "primevue/checkbox";
  import ProgressBar from "primevue/progressbar";
  import Tag from "primevue/tag";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    useMutation,
    useQuery,
  } from "#imports";
  import useTitle from "~/composables/useTitle";

  type RecheckStatus = "UNCHANGED" | "CHANGED" | "UNVERIFIABLE" | "INVALID" | "FAILED" | "NO_IDENTIFIER";
  type DisplayStatus = RecheckStatus | "APPLIED" | "IGNORED";

  type RecheckResult = {
    uid: string,
    vat: string,
    brandName: string,
    status: RecheckStatus,
    storedLegalName: string,
    storedAddress: string,
    apiLegalName: string | null,
    apiAddress: string | null,
    legalNameChanged: boolean,
    addressChanged: boolean,
    error: string | null,
  };

  type Row = RecheckResult & {
    applyLegalName: boolean,
    applyAddress: boolean,
    legalNameApplied: boolean,
    addressApplied: boolean,
    ignored: boolean,
    previousLegalName: string,
    previousAddress: string,
  };

  type ApplyResult = {
    uid: string,
    updated: boolean,
    error: string | null,
  };

  type ApplyInput = {
    uid: string,
    legalName: string | null,
    address: string | null,
    storedLegalName: string,
    storedAddress: string,
  };

  const BATCH_SIZE = 10;

  const statusLabels: Record<DisplayStatus, string> = {
    UNCHANGED: "Bez promjene",
    CHANGED: "Promijenjeno",
    APPLIED: "Primijenjeno",
    IGNORED: "Ignorirano",
    UNVERIFIABLE: "Nije moguće provjeriti",
    INVALID: "Nevaljan VAT",
    FAILED: "Neuspjela provjera",
    NO_IDENTIFIER: "Nema OIB/VAT",
  };

  const statusSeverities: Record<DisplayStatus, string> = {
    UNCHANGED: "success",
    CHANGED: "warning",
    APPLIED: "success",
    IGNORED: "secondary",
    UNVERIFIABLE: "secondary",
    INVALID: "danger",
    FAILED: "danger",
    NO_IDENTIFIER: "info",
  };

  const RecheckQuery = gql`
    query RecheckCompaniesVatData($uids: [String!]!) {
      recheckCompaniesVatData(uids: $uids) {
        uid
        vat
        brandName
        status
        storedLegalName
        storedAddress
        apiLegalName
        apiAddress
        legalNameChanged
        addressChanged
        error
      }
    }
  `;

  const ApplyMutation = gql`
    mutation ApplyCompaniesVatData($updates: [CompanyRecheckApplyInput!]!) {
      applyCompaniesVatData(updates: $updates) {
        uid
        updated
        error
      }
    }
  `;

  const hasPending = (row: Row) =>
    !row.ignored && (
      (row.legalNameChanged && !row.legalNameApplied)
      || (row.addressChanged && !row.addressApplied)
    );

  const displayStatus = (row: Row): DisplayStatus => {
    if ("CHANGED" !== row.status) {
      return row.status;
    }

    if (row.ignored) {
      return "IGNORED";
    }

    return hasPending(row) ? "CHANGED" : "APPLIED";
  };

  export default defineComponent({
    name: "PageAdminCompaniesRecheck",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
      Dropdown,
      Checkbox,
      ProgressBar,
      Tag,
    },

    async setup() {
      useTitle("Admin | Provjera podataka firmi", false);

      const toast = useToast();

      type QCompany = { uid: string, vat: string, brandName: string, legalName: string, address: string, };
      const resp = await useQuery<{ companies: QCompany[], }, never>({
        query: gql`
          query RecheckCompaniesList {
            companies(orderBy: { brandName: asc }) {
              uid
              vat
              brandName
              legalName
              address
            }
          }
        `,
      })().then((resp) => resp?.data);

      const companies = resp?.companies ?? [];

      const rows = ref<Row[]>([]);
      const statusFilter = ref<DisplayStatus | null>(null);
      const isRunning = ref(false);
      const isApplying = ref(false);
      const progress = reactive({ done: 0, total: 0 });

      const toRow = (result: RecheckResult): Row => ({
        ...result,
        applyLegalName: false,
        applyAddress: false,
        legalNameApplied: false,
        addressApplied: false,
        ignored: false,
        previousLegalName: result.storedLegalName,
        previousAddress: result.storedAddress,
      });

      const failedRow = (company: QCompany, error: string): Row => toRow({
        uid: company.uid,
        vat: company.vat,
        brandName: company.brandName,
        status: "FAILED",
        storedLegalName: company.legalName,
        storedAddress: company.address,
        apiLegalName: null,
        apiAddress: null,
        legalNameChanged: false,
        addressChanged: false,
        error,
      });

      const filteredRows = computed(() =>
        statusFilter.value
          ? rows.value.filter((row) => displayStatus(row) === statusFilter.value)
          : rows.value,
      );

      const selectedRows = computed(() =>
        rows.value.filter((row) =>
          !row.ignored
          && "CHANGED" === row.status
          && (
            (row.applyLegalName && !row.legalNameApplied)
            || (row.applyAddress && !row.addressApplied)
          ),
        ),
      );

      const summary = computed(() => {
        if (!rows.value.length) {
          return null;
        }

        const count = (status: DisplayStatus) => rows.value.filter((row) => displayStatus(row) === status).length;

        return {
          checked: rows.value.filter((row) => "NO_IDENTIFIER" !== row.status).length,
          pending: count("CHANGED"),
          applied: count("APPLIED"),
          ignored: count("IGNORED"),
          unverifiable: count("UNVERIFIABLE"),
          invalid: count("INVALID"),
          failed: count("FAILED"),
          noIdentifier: count("NO_IDENTIFIER"),
        };
      });

      const failedCount = computed(() => rows.value.filter((row) => "FAILED" === row.status).length);

      const fetchRows = async (batch: QCompany[]): Promise<Row[]> => {
        const result = await useQuery<{ recheckCompaniesVatData: RecheckResult[], }, { uids: string[], }>({
          query: RecheckQuery,
          variables: { uids: batch.map(({ uid }) => uid) },
        })();

        const byUid = new Map((result?.data?.recheckCompaniesVatData ?? []).map((r) => [ r.uid, r ]));

        return batch.map((company) => {
          const found = byUid.get(company.uid);

          return found
            ? toRow(found)
            : failedRow(company, result?.error?.message ?? "Nema odgovora za ovu firmu");
        });
      };

      const checkCompanies = async (targets: QCompany[], onBatch: (batchRows: Row[]) => void) => {
        isRunning.value = true;
        progress.done = 0;
        progress.total = targets.length;

        try {
          for (let i = 0; i < targets.length; i += BATCH_SIZE) {
            onBatch(await fetchRows(targets.slice(i, i + BATCH_SIZE)));
            progress.done = Math.min(i + BATCH_SIZE, targets.length);
          }
        } finally {
          isRunning.value = false;
        }
      };

      const runRecheck = async () => {
        rows.value = [];

        await checkCompanies(companies, (batchRows) => {
          rows.value.push(...batchRows);
        });
      };

      const retryFailed = async () => {
        const failedUids = new Set(rows.value.filter((row) => "FAILED" === row.status).map(({ uid }) => uid));
        const targets = companies.filter(({ uid }) => failedUids.has(uid));

        await checkCompanies(targets, (batchRows) => {
          for (const row of batchRows) {
            const index = rows.value.findIndex(({ uid }) => uid === row.uid);

            if (-1 !== index) {
              rows.value[index] = row;
            }
          }
        });
      };

      const applyRows = async (targets: Row[]) => {
        const pending = targets
          .map((row) => ({
            row,
            legalName: row.applyLegalName && !row.legalNameApplied ? row.apiLegalName : null,
            address: row.applyAddress && !row.addressApplied ? row.apiAddress : null,
          }))
          .filter(({ row, legalName, address }) => !row.ignored && (null !== legalName || null !== address))
        ;

        if (!pending.length) {
          return;
        }

        const updates: ApplyInput[] = pending.map(({ row, legalName, address }) => ({
          uid: row.uid,
          legalName,
          address,
          storedLegalName: row.storedLegalName,
          storedAddress: row.storedAddress,
        }));

        isApplying.value = true;

        const apply = useMutation<{ applyCompaniesVatData: ApplyResult[], }, { updates: ApplyInput[], }>(ApplyMutation);
        const results: ApplyResult[] = [];

        try {
          for (let i = 0; i < updates.length; i += BATCH_SIZE) {
            const resp = await apply({ updates: updates.slice(i, i + BATCH_SIZE) });
            results.push(...(resp?.data?.applyCompaniesVatData ?? []));
          }
        } finally {
          isApplying.value = false;
        }

        const resultByUid = new Map(results.map((r) => [ r.uid, r ]));
        let ok = 0;
        let failed = 0;

        for (const { row, legalName, address } of pending) {
          const res = resultByUid.get(row.uid);

          if (!res?.updated) {
            failed += 1;
            row.error = res?.error ?? "Ažuriranje nije uspjelo";
            continue;
          }

          ok += 1;
          row.error = null;

          if (null !== legalName) {
            row.legalNameApplied = true;
            row.applyLegalName = false;
            row.storedLegalName = legalName;
          }

          if (null !== address) {
            row.addressApplied = true;
            row.applyAddress = false;
            row.storedAddress = address;
          }
        }

        toast.add({
          severity: failed ? "warn" : "success",
          summary: "Ažuriranje",
          detail: `Ažurirano: ${ ok }, neuspjelo: ${ failed }`,
          life: 4000,
        });
      };

      return {
        companies,
        rows,
        filteredRows,
        statusFilter,
        statusOptions: (Object.keys(statusLabels) as DisplayStatus[]).map((value) => ({
          value,
          label: statusLabels[value],
        })),
        isRunning,
        isApplying,
        isBusy: computed(() => isRunning.value || isApplying.value),
        progress,
        progressPercent: computed(() =>
          progress.total ? Math.round((progress.done / progress.total) * 100) : 0,
        ),
        summary,
        failedCount,
        selectedCount: computed(() => selectedRows.value.length),
        statusLabel: (status: DisplayStatus) => statusLabels[status],
        statusSeverity: (status: DisplayStatus) => statusSeverities[status],
        displayStatus,
        hasPending,
        runRecheck,
        retryFailed,
        applyRows,
        applySelected: () => applyRows(selectedRows.value),
        ignoreRow(row: Row) {
          row.ignored = true;
          row.applyLegalName = false;
          row.applyAddress = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .progress {
    margin-bottom: 1rem;
  }

  .summary {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: rgb(0 0 0 / 2%);
  }

  .diff {
    display: grid;
    gap: .25rem;
  }

  .diffSelect {
    display: flex;
    gap: .5rem;
    align-items: center;
    font-size: .85rem;
  }

  .old {
    text-decoration: line-through;
    color: #b00020;
  }

  .superseded {
    text-decoration: line-through;
    opacity: .6;
  }

  .new {
    color: #1b7f3b;
  }

  .rowActions {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
    align-items: center;
  }
</style>
