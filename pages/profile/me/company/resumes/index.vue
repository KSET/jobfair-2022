<template>
  <app-max-width-container :class="$style.container">
    <client-only>
      <template #fallback>
        <h2>Loading...</h2>
      </template>
      <template #empty>
        <translated-text trans-key="resume.empty" />
      </template>
      <div :class="$style.headerItems">
        <span class="p-input-icon-left">
          <i class="pi pi-search" />
          <InputText v-model="queryFilter.whereUser" placeholder="Search" type="text" />
        </span>
        <nuxt-link
          :to="{ name: 'profile-me-company-scan-qr' }"
        >
          <p-button>
            <i class="pi pi-qrcode p-button-icon p-button-icon-left" />
            <span class="p-button-label">
              <translated-text trans-key="resume.scan" />
            </span>
          </p-button>
        </nuxt-link>
      </div>
      <TabView v-model:active-index="activeTab" lazy>
        <TabPanel v-if="isAdmin">
          <template #header>
            <translated-text trans-key="resume.list.all" />
          </template>

          <DataTable
            v-model:first="queryMeta.first"
            v-model:rows="queryMeta.take"
            :lazy="true"
            :loading="isLoading"
            :paginator="true"
            :rows-per-page-options="[10, 20, 50]"
            :total-records="resumes.total"
            :value="resumes.items"
            current-page-report-template="{first}-{last}/{totalRecords}"
            data-key="uid"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            removable-sort
            striped-rows
            @row-click="handleRowClick"
          >
            <Column field="user.name">
              <template #header>
                <translated-text trans-key="resume.user.name" />
              </template>
            </Column>
            <Column field="user.email">
              <template #header>
                <translated-text trans-key="resume.user.email" />
              </template>
            </Column>
            <Column field="faculty.name">
              <template #header>
                <translated-text trans-key="resume.faculty.name" />
              </template>
            </Column>
            <Column field="faculty.module">
              <template #header>
                <translated-text trans-key="resume.faculty.module" />
              </template>
            </Column>
            <Column>
              <template #body="{ data }">
                <i :class="[$style.heart, { [$style.hidden]: !favourites[data.uid] }]" class="pi pi-heart-fill" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel>
          <template #header>
            <translated-text trans-key="resume.list.scanned" />
          </template>

          <DataTable
            v-model:first="queryMeta.first"
            v-model:rows="queryMeta.take"
            :lazy="true"
            :loading="isLoading"
            :paginator="true"
            :rows-per-page-options="[10, 20, 50]"
            :total-records="resumes.total"
            :value="resumes.items"
            current-page-report-template="{first}-{last}/{totalRecords}"
            data-key="uid"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            removable-sort
            striped-rows
            @row-click="handleRowClick"
          >
            <Column field="user.name">
              <template #header>
                <translated-text trans-key="resume.user.name" />
              </template>
            </Column>
            <Column field="user.email">
              <template #header>
                <translated-text trans-key="resume.user.email" />
              </template>
            </Column>
            <Column field="faculty.name">
              <template #header>
                <translated-text trans-key="resume.faculty.name" />
              </template>
            </Column>
            <Column field="faculty.module">
              <template #header>
                <translated-text trans-key="resume.faculty.module" />
              </template>
            </Column>
            <Column>
              <template #body="{ data }">
                <i :class="[$style.heart, { [$style.hidden]: !favourites[data.uid] }]" class="pi pi-heart-fill" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
        <TabPanel>
          <template #header>
            <translated-text trans-key="resume.list.favourites" />
          </template>

          <DataTable
            v-model:first="queryMeta.first"
            v-model:rows="queryMeta.take"
            :lazy="true"
            :loading="isLoading"
            :paginator="true"
            :rows-per-page-options="[10, 20, 50]"
            :total-records="resumes.total"
            :value="resumes.items"
            current-page-report-template="{first}-{last}/{totalRecords}"
            data-key="uid"
            paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            removable-sort
            striped-rows
            @row-click="handleRowClick"
          >
            <Column field="user.name">
              <template #header>
                <translated-text trans-key="resume.user.name" />
              </template>
            </Column>
            <Column field="user.email">
              <template #header>
                <translated-text trans-key="resume.user.email" />
              </template>
            </Column>
            <Column field="faculty.name">
              <template #header>
                <translated-text trans-key="resume.faculty.name" />
              </template>
            </Column>
            <Column field="faculty.module">
              <template #header>
                <translated-text trans-key="resume.faculty.module" />
              </template>
            </Column>
            <Column>
              <template #body="{ data }">
                <i :class="[$style.heart, { [$style.hidden]: !favourites[data.uid] }]" class="pi pi-heart-fill" />
              </template>
            </Column>
          </DataTable>
        </TabPanel>
      </TabView>
    </client-only>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import {
    MaybeRef,
  } from "@vueuse/shared";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputText from "primevue/inputtext";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    toRef,
    unref,
    useQuery,
    useRouter,
    useThrottleFn,
    watch,
  } from "#imports";
  import {
    IResume,
    IResumeFaculty,
    IUser,
  } from "~/graphql/schema";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageProfileCompanyResumes",

    components: {
      AppMaxWidthContainer,
      TranslatedText,
      DataTable,
      Column,
      InputText,
      TabView,
      TabPanel,
    },

    async setup() {
      const router = useRouter();
      const userStore = useUserStore();

      const queryMeta = reactive({
        take: 10,
        first: 0,
      });
      const queryFilter = reactive({
        whereUser: "",
      });
      const activeTab = ref(0);

      const isLoading = ref(false);

      type QArgs = {
        take: MaybeRef<number>,
        skip: MaybeRef<number>,
        whereUser: MaybeRef<string>,
      };
      type QResume = Pick<IResume, "uid"> & {
        user: Pick<IUser, "name" | "email">,
        faculty: Pick<IResumeFaculty, "name" | "module">,
      };
      type QResumeItems = {
        total: number,
        items: QResume[],
      };
      type QData = {
        resumes?: QResumeItems,
        resumesFavourites?: QResumeItems,
        resumesScanned?: QResumeItems,
        resumeFavourites: string[],
      };
      const resumesQuery = useQuery<QData, QArgs>({
        query: gql`
          query Data($take: Int, $skip: Int, $orderBy: [ResumeOrderByWithRelationAndSearchRelevanceInput!], $whereUser: String) {
            resumes(filter: { take: $take, skip: $skip, orderBy: $orderBy, whereUser: $whereUser }) {
              total
              items {
                uid
                user {
                  name
                  email
                }
                faculty {
                  name
                  module
                }
              }
            }
            resumeFavourites
          }
        `,
        variables: {
          take: toRef(queryMeta, "take"),
          skip: computed(() => queryMeta.first / queryMeta.take),
          whereUser: toRef(queryFilter, "whereUser"),
        },
      });
      const favouritesQuery = useQuery<QData, QArgs>({
        query: gql`
          query Data($take: Int, $skip: Int, $orderBy: [ResumeOrderByWithRelationAndSearchRelevanceInput!], $whereUser: String) {
            resumesFavourites(filter: { take: $take, skip: $skip, orderBy: $orderBy, whereUser: $whereUser }) {
              total
              items {
                uid
                user {
                  name
                  email
                }
                faculty {
                  name
                  module
                }
              }
            }
            resumeFavourites
          }
        `,
        variables: {
          take: toRef(queryMeta, "take"),
          skip: computed(() => queryMeta.first / queryMeta.take),
          whereUser: toRef(queryFilter, "whereUser"),
        },
      });
      const scannedQuery = useQuery<QData, QArgs>({
        query: gql`
          query Data($take: Int, $skip: Int, $orderBy: [ResumeOrderByWithRelationAndSearchRelevanceInput!], $whereUser: String) {
            resumesScanned(filter: { take: $take, skip: $skip, orderBy: $orderBy, whereUser: $whereUser }) {
              total
              items {
                uid
                user {
                  name
                  email
                }
                faculty {
                  name
                  module
                }
              }
            }
            resumeFavourites
          }
        `,
        variables: {
          take: toRef(queryMeta, "take"),
          skip: computed(() => queryMeta.first / queryMeta.take),
          whereUser: toRef(queryFilter, "whereUser"),
        },
      });

      const queries = [
        resumesQuery,
        scannedQuery,
        favouritesQuery,
      ];
      if (!userStore.isAdmin) {
        queries.shift();
      }

      const resumes = reactive({ total: 0, items: [] } as NonNullable<QData["resumes"]>);
      const favourites = ref({} as Record<string, true>);

      const refreshResumes = async () => {
        const query = queries[unref(activeTab)];

        if (!query) {
          return;
        }

        isLoading.value = true;
        const resp = await query().then((res) => res?.data);
        {
          const res = resp?.resumes ?? resp?.resumesFavourites ?? resp?.resumesScanned;
          if (res) {
            resumes.items = res?.items || [];
            resumes.total = res?.total || 0;
          }
        }
        {
          const favs = resp?.resumeFavourites;
          if (favs) {
            favourites.value = Object.fromEntries(favs.map((uid) => [ uid, true ]));
          }
        }
        isLoading.value = false;
      };

      await refreshResumes();
      watch(
        [ queryMeta, activeTab ],
        refreshResumes,
      );
      watch(
        queryFilter,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        useThrottleFn(refreshResumes, 350),
      );

      return {
        activeTab,
        queryMeta,
        queryFilter,
        resumes,
        favourites,
        isLoading,
        isAdmin: computed(() => userStore.isAdmin),
        async handleRowClick(event: { data: QResume, }) {
          await router.push({
            name: "profile-me-company-resumes-uid",
            params: {
              uid: event.data.uid,
            },
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {
    flex-direction: column;
    padding-top: 1rem;

    .headerItems {
      display: flex;
      align-items: center;
      gap: 1rem;

      > *:first-child {
        margin-left: auto;
      }

      @include media(md) {
        flex-direction: column;

        > *:first-child {
          margin-left: 0;
        }

        > *:last-child {
          margin-left: auto;
        }
      }

      button {
        color: $fer-black !important;
      }
    }

    :global(.p-datatable-table) *[role="row"] {
      cursor: pointer;
    }

    .heart {
      color: rgb(0 0 0 / 30%);
    }

    .hidden {
      display: none;
    }
  }
</style>