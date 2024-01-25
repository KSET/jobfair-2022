<template>
  <app-max-width-container>
    <h1>Skeneri</h1>

    <div>
      <nuxt-link
        :to="{ name: 'admin' }"
      >
        &larr; Back
      </nuxt-link>
    </div>

    <DataTable
      ref="dt"
      v-model:filters="tableFilters"
      class="p-datatable-sm mt-5"
      data-key="uid"
      :value="users"
      row-hover
      paginator
      :rows="50"
      :rows-per-page-options="[2,5,10,20,50,100]"
      responsive-layout="scroll"
      removable-sort
      striped-rows
      :default-sort-order="-1"
      :multi-sort-meta="[{field: 'isScanner', order: -1}]"
      sort-mode="multiple"
      :row-class="(user: DUser) => ({
        'p-disabled': user.meta.isLoading,
      })"
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    >
      <template #header>
        <div :class="$style.tableHeader">
          <p-button icon="pi pi-external-link" label="Export" @click="exportCSV()" />

          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="tableFilters['global'].value" placeholder="Pretraži firme" />
          </span>
        </div>
      </template>
      <Column
        field="name"
        header="Ime"
        sortable
      />
      <Column
        field="email"
        header="Email"
        sortable
      />
      <Column
        field="isScanner"
        header="Skener"
        sortable
      >
        <template #body="{ data: user }">
          <InputSwitch
            v-model="user.isScanner"
            :disabled="user.meta.isLoading"
            @change="handleScannerSwitch(user)"
          />
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputSwitch from "primevue/inputswitch";
  import InputText from "primevue/inputtext";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    FilterMatchMode, FilterService,
  } from "primevue/api";
  import useTitle from "~/composables/useTitle";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useQuery,
    useMutation,
  } from "~/composables/useQuery";
  import {
    ref,
    reactive,
  } from "#imports";
  import {
    type PageAdminUsersScannersQuery,
  } from "~/graphql/client/graphql";

  useTitle("Admin | Skeneri");

  const toast = useToast();

  const dt = ref<DataTable | null>(null);

  type QUser = PageAdminUsersScannersQuery["users"][number];

  const transformUser =
    (user: QUser) =>
      reactive({
        ...user,
        isScanner: user.roles.some((r) => "scanner" === r.name),
        meta: {
          isLoading: false,
        },
      })
  ;

  const users = await useQuery({
    query: graphql(/* GraphQL */`
      query PageAdminUsersScanners {
          users {
            uid
            name
            email
            roles {
              name
            }
          }
      }
    `),
  })()
    .then((res) => {
      return (
        res
          ?.data
          ?.users
          .map(transformUser)
        ?? []
      );
    })
  ;

  const tableFilters = ref({
    global: { value: null as string | null, matchMode: "$global" },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  FilterService.register("$global", (value: unknown, filter: string | null | undefined) => {
    if (filter === undefined || null === filter || "" === filter.trim()) {
      return true;
    }

    const lowerFilter = filter.toLocaleLowerCase().trim();

    if ("string" === typeof value) {
      return value.toLowerCase().includes(lowerFilter);
    }

    return false;
  });
  const exportCSV = () => {
    dt.value?.exportCSV();
  };

  type DUser = typeof users[number];

  const updateScannerStatusForMutation = useMutation(graphql(/* GraphQL */`
    mutation PageAdminUsersScannersUpdateIsScanner($uid: String!, $isScanner: Boolean!) {
      updateScannerStatusFor(uid: $uid, isScanner: $isScanner)
    }
  `));

  const handleScannerSwitch = (user: DUser) => {
    user.meta.isLoading = true;
    updateScannerStatusForMutation({
      uid: user.uid,
      isScanner: user.isScanner,
    })
      .then((res) => {
        if (!res) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Something went wrong. Please try again.",
          });
          return;
        }

        const {
          error,
          data,
        } = res;

        if (error) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: error.message,
          });
          return;
        }

        if (!data) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Something went wrong. Please try again.",
          });
          return;
        }

        const newIsScanner = data.updateScannerStatusFor;

        user.isScanner = newIsScanner;
      })
      .catch((e) => {
        console.error(e);

        user.isScanner = false;

        return null;
      })
      .finally(() => {
        user.meta.isLoading = false;
      })
    ;
  };
</script>

<style lang="scss" module>
  .tableHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
