<template>
  <app-max-width-container :class="$style.container">
    <h1>Event log</h1>

    <div>
      <nuxt-link :to="{ name: 'admin' }">
        <p-button>
          &larr; Natrag
        </p-button>
      </nuxt-link>
    </div>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      v-model:rows="perPage"
      :class="$style.table"
      :loading="eventLogLoading"
      :rows-per-page-options="[2,5,10,20,50,100]"
      :total-records="eventLog?.totalRecords"
      :value="eventLog?.records"
      data-key="id"
      lazy
      paginator
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      removable-sort
      responsive-layout="scroll"
      row-hover
      striped-rows
      @page="onPage"
      @sort="onSort"
    >
      <template #header>
        <div :class="$style.tableHeader">
          <p-button icon="pi pi-external-link" label="Export" @click="exportCSV()" />

          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Pretraži event log" />
          </span>
        </div>
      </template>
      <Column :sortable="true" field="id" header="#" header-style="width: 6em" />
      <Column :sortable="true" field="name" header="Ime eventa">
        <template #body="{ data }">
          <pre v-text="data.name" />
        </template>
      </Column>
      <Column :sortable="true" field="date" header="Datum">
        <template #body="{ data }">
          {{ data.date.toLocaleString() }}
        </template>
      </Column>
      <Column :sortable="true" field="userInfo" header="Korisnik">
        <template #body="{ data }">
          <NuxtLink v-if="data.user" :to="{ name: 'admin-users-uid-edit', params: { uid: data.user?.uid } }">
            {{ data.userInfo }}
          </NuxtLink>
        </template>
      </Column>
      <Column :sortable="true" field="data" header="Podatci">
        <template #body="{ data }">
          <pre :class="$style.dataContainer">
            <AppJsonViewer
              :json="data.data"
              expanded
              json-is-raw
            />
          </pre>
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import DataTable, {
    type DataTablePageEvent,
    type DataTableSortEvent,
  } from "primevue/datatable";
  import Column from "primevue/column";
  import {
    FilterMatchMode,
    FilterService,
  } from "primevue/api";
  import InputText from "primevue/inputtext";
  import {
    type MaybeRef,
  } from "@vueuse/shared";
  import {
    type UnwrapRef,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    ref,
    unref,
    useAsyncData,
    useQuery,
    useThrottleFn,
    watch,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    type IEventLog,
    type IEventLogOrderByWithRelationInput,
    ISortOrder,
    type IUser,
  } from "~/graphql/schema";
  import AppJsonViewer from "~/components/util/app-json-viewer.vue";

  export default defineComponent({
    name: "PageAdminUsersList",

    components: {
      AppJsonViewer,
      AppMaxWidthContainer,
      DataTable,
      Column,
      InputText,
    },

    async setup() {
      useTitle("Admin | Users - Event Log", false);
      const perPage = ref(20);
      const curPage = ref(1);
      const orderBy = ref<IEventLogOrderByWithRelationInput[]>([]);

      const filters = ref({
        global: { value: "", matchMode: "$global" },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        userInfo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        data: { value: null, matchMode: FilterMatchMode.CONTAINS },
        date: { value: null, matchMode: FilterMatchMode.DATE_IS },
      });

      const globalFilter = ref(filters.value.global.value);

      watch(
        filters,
        useThrottleFn((newFilters: UnwrapRef<typeof filters>) => {
          globalFilter.value = newFilters.global.value;
        }, 500, true, true),
        {
          deep: true,
        },
      );

      type QUser = Pick<IUser, "uid" | "name" | "email">;
      type QEventLog = IEventLog & {
        user: QUser | null,
      };
      type QData = {
        eventLog: {
          page: number,
          perPage: number,
          totalRecords: number,
          records: QEventLog[],
        },
      };
      type QArgs = {
        page: MaybeRef<number>,
        perPage: MaybeRef<number>,
        orderBy?: MaybeRef<IEventLogOrderByWithRelationInput[]>,
        where?: MaybeRef<string>,
      };

      const eventLogQuery = useQuery<QData, QArgs>({
        query: gql`
          query Data(
            $page: Int!,
            $perPage: Int!,
            $where: String,
            $orderBy: [EventLogOrderByWithRelationInput!]
          ) {
             eventLog(
                page: $page,
                perPage: $perPage,
                where: $where,
                orderBy: $orderBy,
             ) {
               page
               perPage
               totalRecords
               records {
                 id
                 name
                 date
                 data
                 user {
                   uid
                   name
                   email
                 }
               }
             }
           }
         `,
        variables: {
          page: curPage,
          perPage,
          orderBy,
          where: globalFilter,
        },
      });

      const {
        data: eventLog,
        pending: eventLogLoading,
      } = await useAsyncData(
        "eventLog",
        () =>
          eventLogQuery()
            .then((resp) => resp?.data?.eventLog ?? { page: 1, perPage: 20, totalRecords: 0, records: [] })
            .then((eventLog) => {
              return {
                ...eventLog,
                records: eventLog.records.map((event) => ({
                  ...event,
                  date: new Date(event.date),
                  userInfo: event.user ? `${ event.user.name } <${ event.user.email }>` : null,
                })),
              };
            })
        ,
        {
          watch: [
            perPage,
            curPage,
            orderBy,
            globalFilter,
          ],
        },
      );

      type EventLog = NonNullable<UnwrapRef<typeof eventLog>>["records"][number];

      FilterService.register("$global", (value: unknown, filter: string | null | undefined) => {
        if (filter === undefined || null === filter || "" === filter.trim()) {
          return true;
        }

        const lowerFilter = filter.toLocaleLowerCase().trim();

        if ("string" === typeof value) {
          return value.toLocaleLowerCase().includes(lowerFilter);
        }

        return false;
      });

      const dt = ref<DataTable | null>(null);

      return {
        perPage,
        curPage,
        dt,
        filters,
        sort: orderBy,
        eventLog,
        eventLogLoading,
        onPage(event: DataTablePageEvent) {
          curPage.value = event.page + 1;
        },
        onSort(event: DataTableSortEvent) {
          const sortField = event.sortField as keyof EventLog | null;

          if (!sortField) {
            orderBy.value = [];

            return;
          }

          const sortOrder = 1 === event.sortOrder ? ISortOrder.Asc : ISortOrder.Desc;

          switch (sortField) {
            case "userInfo": {
              orderBy.value = [
                {
                  user: {
                    firstName: sortOrder,
                  },
                },
                {
                  user: {
                    lastName: sortOrder,
                  },
                },
                {
                  user: {
                    email: sortOrder,
                  },
                },
              ];

              return;
            }

            default: {
              orderBy.value = [
                {
                  [sortField]: sortOrder,
                },
              ];
            }
          }
        },
        exportCSV() {
          const $dt = unref(dt);

          if (!$dt) {
            return;
          }

          $dt.exportCSV();
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container .table table {
    width: 100%;
    table-layout: fixed;

    tr {

      > td {
        vertical-align: middle;

        > pre {
          margin: 0;
          white-space: pre-line;
          word-break: break-word;
        }
      }
    }
  }

  .dataContainer {
    line-height: 0;
  }

  .tableHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
