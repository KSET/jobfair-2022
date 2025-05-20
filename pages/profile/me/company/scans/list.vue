<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1>
      <TranslatedText trans-key="profile.company.scanUsers.scanned" />
    </h1>

    <div>
      <NuxtLink :to="{ name: 'profile-me' }">
        <Button severity="secondary" type="button">
          &larr; <TranslatedText trans-key="back" />
        </Button>
      </NuxtLink>
    </div>

    <DataTable
      ref="dt"
      v-model:filters="filters"
      :rows="20"
      :rows-per-page-options="[2, 5, 10, 20, 50, 100]"
      :value="scanned"
      data-key="user.uid"
      paginator
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      removable-sort
      responsive-layout="scroll"
      row-hover
      striped-rows
      :row-class="(entry: DEntry) => ({
        'p-disabled': entry.meta.isLoading,
      })"
      sort-mode="multiple"
    >
      <template #header>
        <div :class="$style.tableHeader">
          <Button type="button" icon="pi pi-external-link" label="Export" @click="exportCSV" />

          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" :placeholder="translate('search.users')" />
          </span>
        </div>
      </template>

      <Column
        :sortable="true"
        field="user.uid"
        header="#"
        header-style="width: 6em"
      >
        <template #body="{ index }">
          {{ index + 1 }}
        </template>
      </Column>

      <Column field="user.name" sortable>
        <template #header>
          <translated-text trans-key="resume.user.name" />
        </template>
      </Column>

      <Column field="user.email" sortable>
        <template #header>
          <translated-text trans-key="resume.user.email" />
        </template>
      </Column>

      <Column field="user.phone" sortable>
        <template #header>
          <translated-text trans-key="resume.phone" />
        </template>
      </Column>

      <Column field="note" sortable>
        <template #header>
          <translated-text trans-key="resume.user.note" />
        </template>
        <template #body="{ data }">
          <form class="flex flex-column" @submit="handleItemFormSubmit(data, $event)">
            <textarea v-model="data.note" />
            <div class="flex">
              <Button class="ml-auto mt-1" size="small" type="submit">
                <TranslatedText trans-key="form.save" />
              </Button>
            </div>
          </form>
        </template>
      </Column>

      <Column field="isStarred" header="⭐" sortable>
        <template #body="{ data }">
          <Button
            text
            rounded
            :loading="data.meta.isLoading"
            :aria-label="data.isStarred ? 'Star' : 'Unstar'"
            type="button"
            :icon="data.isStarred ? 'pi pi-star-fill' : 'pi pi-star'"
            @click="handleToggleStar(data)"
          />
        </template>
      </Column>
    </DataTable>

    <div class="flex mt-3">
      <a class="ml-auto" href="/api/user/resume/export/all.xlsx" target="_blank">
        <p-button class="p-button-text">
          <i class="pi pi-download p-button-icon p-button-icon-left" />
          <span class="p-button-label"><translated-text trans-key="resume.download-all" /></span>
        </p-button>
      </a>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Button from "primevue/button";
  import InputText from "primevue/inputtext";
  import {
    FilterMatchMode, FilterService,
  } from "primevue/api";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    type PageProfileMeCompanyScansListDataQuery,
  } from "~/graphql/client/graphql";
  import {
    useUserStore,
  } from "~/store/user";

  const translationsStore = useTranslationsStore();
  const userStore = useUserStore();
  const toast = useToast();

  const user = computed(() => userStore.user!);

  const translate = computed(() => translationsStore.translation);

  const dt = ref<DataTable | null>(null);

  useTitle("profile.company.scanUsers.scanned");

  type QEntry = PageProfileMeCompanyScansListDataQuery["scannedUsers"][number];

  const transformScanned =
    (entry: QEntry) =>
      entry.user
        ? reactive({
          ...entry,
          user: entry.user,
          note: entry.note ?? "",
          scannedAt: new Date(String(entry.scannedAt)),
          meta: {
            isLoading: false,
          },
        })
        : null
  ;

  const scanned = await useQuery({
    query: graphql(/* GraphQL */ `
      query PageProfileMeCompanyScansListData(
        $companyUid: String
        $seasonUid: String
      ) {
        scannedUsers(companyUid: $companyUid, seasonUid: $seasonUid) {
          user {
            uid
            name
            email
            phone
          }
          note
          isStarred
          scannedAt
        }
      }
    `),
  })()
    .then((res) => res?.data?.scannedUsers ?? [])
    .then((res) => res.map(transformScanned))
    .then((res) => res.filter(Boolean))
  ;

  type DEntry = (typeof scanned)[number];

  const refineUserScanMutation = useMutation(graphql(/* GraphQL */`
    mutation PageProfileMeCompanyScansListRefineQrScan($userUid: String!, $refineData: CompanyScanUserQrRefineData!) {
        scanUserQrRefine(userUid: $userUid, refineData: $refineData) {
            user {
                uid
                name
                email
                phone
            }
            isStarred
            note
            error
        }
    }
  `));

  const filters = ref({
    global: { value: null as string | null, matchMode: "$global" },
    "user.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "user.email": { value: null, matchMode: FilterMatchMode.CONTAINS },
    "user.phone": { value: null, matchMode: FilterMatchMode.CONTAINS },
    note: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
    const $dt = unref(dt);

    if (!$dt) {
      return;
    }

    $dt.exportCSV();
  };

  const handleToggleStar = async (item: DEntry) => {
    item.meta.isLoading = true;
    try {
      const resp = await refineUserScanMutation({
        userUid: user.value.uid,
        refineData: {
          isStarred: !item.isStarred,
        },
      }).then((resp) => resp?.data?.scanUserQrRefine);

      if (resp?.error) {
        toast.add({
          severity: "error",
          summary: resp.error,
          closable: true,
          life: 3000,
        });
      }

      {
        const user = resp?.user;

        if (user) {
          Object.assign(item, resp);
        }
      }
    } finally {
      item.meta.isLoading = false;
    }
  };

  const handleItemFormSubmit = async (item: DEntry, e: Event) => {
    e.preventDefault();
    item.meta.isLoading = true;
    try {
      const resp = await refineUserScanMutation({
        userUid: user.value.uid,
        refineData: {
          note: item.note,
        },
      }).then((resp) => resp?.data?.scanUserQrRefine);

      if (resp?.error) {
        toast.add({
          severity: "error",
          summary: resp.error,
          closable: true,
          life: 3000,
        });
      }

      {
        const user = resp?.user;

        if (user) {
          Object.assign(item, resp);
        }
      }
    } finally {
      item.meta.isLoading = false;
    }
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
