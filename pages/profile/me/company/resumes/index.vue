<template>
  <app-max-width-container :class="$style.container">
    <LazyClientOnly>
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
        <TabPanel v-if="showAll">
          <template #header>
            <translated-text trans-key="resume.list.all" />
          </template>
        </TabPanel>

        <TabPanel>
          <template #header>
            <translated-text trans-key="resume.list.scanned" />
          </template>
        </TabPanel>

        <TabPanel>
          <template #header>
            <translated-text trans-key="resume.list.favourites" />
          </template>
        </TabPanel>
      </TabView>

      <DataTable
        v-model:first="queryMeta.first"
        v-model:rows="queryMeta.take"
        :class="$style.table"
        :loading="isLoading"
        :rows-per-page-options="queryMeta.perPageOptions"
        :total-records="resumes.total"
        :value="resumes.items"
        current-page-report-template="{first}-{last}/{totalRecords}"
        data-key="uid"
        lazy
        paginator
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
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
    </LazyClientOnly>
    <div class="flex mt-3">
      <a class="ml-auto" href="/api/user/resume/export/all.xlsx" target="_blank">
        <p-button class="p-button-text">
          <i class="pi pi-download p-button-icon p-button-icon-left" />
          <span class="p-button-label"><translated-text trans-key="resume.download-all" /></span>
        </p-button>
      </a>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import InputText from "primevue/inputtext";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import {
    clamp,
  } from "rambdax";
  import {
    MaybeRef,
  } from "~/helpers/type";
  import {
    computed,
    createError,
    defineComponent,
    reactive,
    ref,
    toRef,
    unref,
    useQuery,
    useRoute,
    useRouter,
    useThrottleFn,
    useTitle,
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
  import {
    useCompanyStore,
  } from "~/store/company";

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
      useTitle("profile.company.resumes");

      if ("$WITH_CV" !== process.env.NODE_ENV) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }

      const router = useRouter();
      const route = useRoute();
      const userStore = useUserStore();
      const companyStore = useCompanyStore();

      const perPageOptions = [ 10, 20, 50 ].sort((a, b) => a - b);
      const queryMeta = reactive({
        take: perPageOptions[0],
        first: 0,
        perPageOptions,
      });
      const queryFilter = reactive({
        whereUser: "",
      });
      const activeTab = ref(0);

      if (route.query.q && !Array.isArray(route.query.q)) {
        queryFilter.whereUser = route.query.q;
      }

      if (route.query.p && !Array.isArray(route.query.p)) {
        const page = Number(route.query.p);

        if (!isNaN(page)) {
          queryMeta.first = clamp(
            0,
            Infinity,
            page,
          );
        }
      }

      if (route.query.n && !Array.isArray(route.query.n)) {
        const take = Number(route.query.n);

        if (!isNaN(take)) {
          queryMeta.take = clamp(
            queryMeta.perPageOptions[0],
            queryMeta.perPageOptions[queryMeta.perPageOptions.length - 1],
            take,
          );
        }
      }

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

      watch([ queryMeta, queryFilter ], async ([ meta, filter ]) => {
        const query = {
          p: String(meta.first),
          n: String(meta.take),
          q: String(filter.whereUser),
        };

        await router.replace({
          name: "profile-me-company-resumes",
          query,
          replace: true,
        });
      });

      const showAll = computed(() => userStore.isAdmin || companyStore.hasFeedback);

      const queries = computed(() => {
        const queryList = [
          scannedQuery,
          favouritesQuery,
        ];

        if (unref(showAll)) {
          queryList.unshift(resumesQuery);
        }

        return queryList;
      });

      const resumes = reactive({ total: 0, items: [] } as NonNullable<QData["resumes"]>);
      const favourites = ref({} as Record<string, true>);

      const refreshResumes = async () => {
        const query = unref(queries)[unref(activeTab)];

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
        useThrottleFn(refreshResumes, 350, true),
      );

      return {
        activeTab,
        queryMeta,
        queryFilter,
        resumes,
        favourites,
        isLoading,
        showAll,
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

    :global(.p-tabview) {

      :global(.p-tabview-panels) {
        padding: 0;
      }
    }

    .table {

      :global {
        @include media(md) {

          .p-paginator-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr;

            .p-paginator-pages,
            .p-paginator-rpp-options,
            .p-paginator-current {
              grid-column: span 2;
            }

            .p-paginator-pages {
              text-align: center;
            }

            .p-paginator-rpp-options {
              justify-self: center;
            }
          }

        }
      }
    }
  }
</style>
