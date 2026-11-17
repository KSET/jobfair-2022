<template>
  <app-max-width-container>
    <h1>Mapiranje fakulteta</h1>

    <div>
      <nuxt-link :to="{ name: 'admin' }">
        <p-button>
          &larr; Natrag
        </p-button>
      </nuxt-link>
    </div>

    <p
      v-if="successMessage"
      :class="$style.success"
      v-text="successMessage"
    />

    <p
      v-if="loadError"
      :class="$style.error"
      v-text="loadError"
    />

    <p v-else-if="rows.length === 0">
      Sve vrijednosti su mapirane.
    </p>

    <DataTable
      v-else
      :value="rows"
      data-key="name"
      row-hover
    >
      <Column field="name" header="Upisana vrijednost" />
      <Column field="count" header="Broj korisnika" />
      <Column header="Novi fakultet">
        <template #body="{ data: row, index }">
          <app-dropdown
            v-model="row.to"
            :disabled="row.loading"
            :name="`faculty-mapper-${ index }`"
            :options="facultyOptions"
            :placeholder="facultyInput.placeholder"
            v-bind="facultyInput.attrs"
          />
        </template>
      </Column>
      <Column>
        <template #body="{ data: row }">
          <p-button
            :disabled="!row.to || row.loading"
            :loading="row.loading"
            label="Primijeni"
            @click="apply(row)"
          />
          <p-button
            :class="$style.clearButton"
            :disabled="row.loading"
            class="p-button-danger"
            label="Obriši"
            @click="clear(row)"
          />
          <small
            v-if="row.error"
            :class="$style.error"
            v-text="row.error"
          />
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    ref,
    unref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppDropdown from "~/components/util/form/app-dropdown.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    facultyDropdownInput,
  } from "~/helpers/forms/faculty";

  type Row = {
    name: string,
    count: number,
    to: string,
    loading: boolean,
    error: string,
  };

  export default defineComponent({
    name: "PageAdminUsersFacultyMapper",

    components: {
      AppMaxWidthContainer,
      AppDropdown,
      DataTable,
      Column,
    },

    async setup() {
      useTitle("Admin | Mapiranje fakulteta", false);

      type QData = { unmappedFaculties: { name: string, count: number, }[], };
      type MData = { remapFaculty: number, };
      type MVars = { from: string, to: string, };
      type CData = { clearFaculty: number, };
      type CVars = { from: string, };

      const loadError = ref("");

      const unmapped = await useQuery<QData, never>({
        query: gql`
          query PageAdminUsersFacultyMapper {
            unmappedFaculties {
              name
              count
            }
          }
        `,
      })().then((resp) => {
        const list = resp?.data?.unmappedFaculties;

        // Without this, a failed load would look like "everything is mapped".
        if (!list) {
          loadError.value = resp?.error?.message || "Učitavanje nije uspjelo.";
        }

        return list ?? [];
      });

      const rows = ref<Row[]>(
        unmapped.map(({ name, count }) => ({
          name,
          count,
          to: "",
          loading: false,
          error: "",
        })),
      );

      const successMessage = ref("");

      const facultyInput = facultyDropdownInput("");
      const facultyOptions = unref(facultyInput.options);

      const remapFaculty = useMutation<MData, MVars>(gql`
        mutation PageAdminUsersFacultyMapperRemap($from: String!, $to: String!) {
          remapFaculty(from: $from, to: $to)
        }
      `);

      const clearFaculty = useMutation<CData, CVars>(gql`
        mutation PageAdminUsersFacultyMapperClear($from: String!) {
          clearFaculty(from: $from)
        }
      `);

      const runRowAction = async (
        row: Row,
        action: () => Promise<{ updated?: number | null, error?: { message: string, }, } | null>,
        successText: (updated: number) => string,
      ) => {
        row.loading = true;
        row.error = "";

        try {
          const resp = await action();
          const updated = resp?.updated;

          if (resp?.error || null === updated || undefined === updated) {
            row.error = resp?.error?.message || "Promjena nije uspjela.";
            return;
          }

          rows.value = rows.value.filter((r) => r.name !== row.name);
          successMessage.value = successText(updated);
        } finally {
          row.loading = false;
        }
      };

      const apply = async (row: Row) => {
        const { name: from, to, count } = row;

        if (!to) {
          return;
        }

        if (!window.confirm(`Promijeni '${ from }' → '${ to }' za ${ count } korisnika?`)) {
          return;
        }

        await runRowAction(
          row,
          () => remapFaculty({ from, to }).then((resp) => resp && { updated: resp.data?.remapFaculty, error: resp.error }),
          (updated) => `Promijenjeno '${ from }' → '${ to }' za ${ updated } korisnika.`,
        );
      };

      const clear = async (row: Row) => {
        const { name: from, count } = row;

        if (!window.confirm(`Obriši '${ from }' za ${ count } korisnika? Fakultet i modul ostat će prazni.`)) {
          return;
        }

        await runRowAction(
          row,
          () => clearFaculty({ from }).then((resp) => resp && { updated: resp.data?.clearFaculty, error: resp.error }),
          (updated) => `Obrisano '${ from }' za ${ updated } korisnika.`,
        );
      };

      return {
        rows,
        loadError,
        successMessage,
        facultyInput,
        facultyOptions,
        apply,
        clear,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .success {
    font-weight: bold;
  }

  .clearButton {
    margin-left: .5em;
  }

  .error {
    display: block;
    margin-top: .25em;
    color: $fer-error;
  }
</style>
