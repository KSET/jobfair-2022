<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1>Scanned</h1>

    <div>
      <NuxtLink :to="{ name: 'admin' }">
        <Button severity="secondary" type="button">
          &larr; <TranslatedText trans-key="back" />
        </Button>
      </NuxtLink>
    </div>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      data-key="user.uid"
      paginator
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      removable-sort
      responsive-layout="scroll"
      row-hover
      striped-rows
      :value="pageData?.gateGuardianScanList ?? []"
      :rows="20"
      :rows-per-page-options="[2, 5, 10, 20, 50, 100]"
      sort-mode="multiple"
    >
      <template #header>
        <div :class="$style.tableHeader">
          <Button
            type="button"
            icon="pi pi-external-link"
            label="Export"
            @click="exportCSV"
          />

          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Pretraži"
            />
          </span>
        </div>
      </template>

      <Column sortable field="idx" header="#" />
      <Column sortable field="eventType" header="Tip" />
      <Column sortable field="event" header="Event">
        <template #body="{ data }">
          {{ calendarItemText(data) }}
        </template>
      </Column>
      <Column sortable field="forUser.name" header="Ime" />
      <Column sortable field="forUser.email" header="Email" />
      <Column sortable field="forUser.phone" header="Broj" />
      <Column sortable field="scannedAt" header="Skeniran">
        <template #body="{ data }">
          <UtilReRenderClientside>
            <time
              :datetime="data.scannedAt"
              v-text="data.scannedAt.toLocaleString('hr-HR')"
            />
          </UtilReRenderClientside>
        </template>
      </Column>
    </DataTable>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import Button from "primevue/button";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputText from "primevue/inputtext";
  import {
    FilterMatchMode, FilterService,
  } from "primevue/api";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    type PageAdminSeasonReservationsScannedDataQuery,
  } from "~/graphql/client/graphql";

  useTitle("Skenirani | Admin");

  type QData = NonNullable<
    PageAdminSeasonReservationsScannedDataQuery["gateGuardianScanList"]
  >[number];

  const dt = ref<DataTable | null>(null);
  const exportCSV = () => {
    const $dt = unref(dt);

    if (!$dt) {
      return;
    }

    $dt.exportCSV();
  };

  const seasonsStore = useSeasonsStore();

  const filters = ref({
    global: { value: null as string | null, matchMode: "$global" },
    eventType: { value: null, matchMode: FilterMatchMode.CONTAINS },
    event: { value: null, matchMode: FilterMatchMode.CONTAINS },
    "forUser.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "forUser.email": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "forUser.phone": { value: null, matchMode: FilterMatchMode.CONTAINS },
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


  const season = seasonsStore.season!.uid!;

  const pageData = await useQuery({
    query: graphql(/* GraphQL */ `
    query PageAdminSeasonReservationsScannedData($season: String!) {
      gateGuardianScanList(season: $season) {
        eventType
        eventId
        forUser {
          uid
          name
          email
          phone
        }
        scannedBy {
          uid
          name
        }
        forCalendarItem {
          uid
          companies {
            uid
            brandName
          }
          forTalk {
            uid
            titleHr
            titleEn
          }
          forWorkshop {
            uid
            titleHr
            titleEn
          }
          forPanel {
            uid
            name
          }
        }
        scannedAt
      }
    }
  `),
    variables: {
      season,
    },
  })()
    .then((res) => res?.data)
    .then((res) => {
      if (!res) {
        return;
      }

      return {
        ...res,
        gateGuardianScanList: res.gateGuardianScanList?.map((scan, i) => ({
          ...scan,
          idx: i + 1,
          scannedAt: new Date(scan.scannedAt as string),
        })),
      };
    });

  const calendarItemText = (item: QData) => {
    const calendarItem = item.forCalendarItem;
    if (!calendarItem) {
      return null;
    }

    const companies = calendarItem.companies?.map((x) => x.brandName).join(", ");

    const eventTitle =
      calendarItem.forTalk?.titleHr
      ?? calendarItem.forWorkshop?.titleHr
      ?? calendarItem.forPanel?.name;

    return `[${ companies ?? "?" }] ${ eventTitle ?? "?" }`;
  };
</script>

<style lang="scss" module>
.container {

  .tableHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>

