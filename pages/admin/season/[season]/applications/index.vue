<template>
  <app-max-width-container :class="$style.container">
    <h1>Prijave</h1>

    <div>
      <h2>Prijave ({{ companyApplications.length }})</h2>
      <div :class="$style.statistics">
        <div>
          <strong>Industrije</strong>
          <dl>
            <dd
              v-for="(count, name) in statistics.company.byIndustry"
              :key="name"
            >
              <span v-text="name" />
              <data :value="count" v-text="count" />
            </dd>
          </dl>
        </div>

        <div>
          <strong>Štandovi</strong>
          <dl>
            <dd
              v-for="(count, name) in statistics.booths"
              :key="name"
            >
              <span v-text="booths[name]" />
              <data :value="count" v-text="count" />
            </dd>
          </dl>
        </div>

        <div>
          <strong>Talkovi</strong>
          <dl>
            <dd
              v-for="(count, name) in statistics.talks"
              :key="name"
            >
              <span v-text="name" />
              <data :value="count" v-text="count" />
            </dd>
          </dl>
        </div>

        <div>
          <strong>Workshopovi</strong>
          <data :value="statistics.workshops" v-text="statistics.workshops" />
        </div>

        <div>
          <strong>Kokteli</strong>
          <data :value="statistics.cocktails" v-text="statistics.cocktails" />
        </div>

        <div>
          <strong>Paneli</strong>
          <data :value="statistics.panels" v-text="statistics.panels" />
        </div>
      </div>
      <DataTable
        ref="dt"
        v-model:filters="filters"
        v-model:expandedRows="expandedRows"
        :value="companyApplications"
        data-key="forCompany.uid"
        row-hover
        responsive-layout="scroll"
      >
        <template #header>
          <div :class="$style.tableHeader">
            <div :class="$style.buttonGroup">
              <p-button
                v-tooltip.bottom="isMobile ? 'Export CSV' : ''"
                icon="pi pi-external-link"
                :label="isMobile ? '' : 'Export'"
                @click="exportCSV"
              />
              <p-button
                icon="pi pi-plus"
                label="Expand All"
                @click="expandAll"
              />
              <p-button
                icon="pi pi-minus"
                label="Collapse All"
                @click="collapseAll"
              />
            </div>

            <span :class="$style.searchWrapper">
              <i class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                placeholder="Pretraži prijave"
                :class="$style.searchInput"
              />
            </span>
          </div>
        </template>
        <Column :expander="true" header-style="width: 3rem" />
        <Column field="forCompany.brandName" header="Firma" sortable>
          <template #body="{ data }">
            <strong v-tooltip.top="data.forCompany.legalName" v-text="data.forCompany.brandName" />
          </template>
        </Column>
        <Column field="booth" header="Štand" sortable>
          <template #body="{ data }">
            <kbd
              v-if="data.booth"
              class="p-1 px-2 border-round"
              style="background: rgb(62 13 64 / 30%);"
              v-text="booths[data.booth]"
            />
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="talk.titleEn" header="Talk">
          <template #body="{ data }">
            <i v-if="data.talk" class="pi pi-check" />
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="workshop.titleEn" header="Workshop">
          <template #body="{ data }">
            <i v-if="data.workshop" class="pi pi-check" />
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="wantsCocktail" header="Cocktail" sortable>
          <template #body="{ data }">
            <i v-if="data.wantsCocktail" class="pi pi-check" />
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="wantsPanel" header="Panel" sortable>
          <template #body="{ data }">
            <i v-if="data.wantsPanel" class="pi pi-check" />
            <span v-else>-</span>
          </template>
        </Column>
        <Column body-style="text-align: center; overflow: visible" header-style="width: 4rem; text-align: center">
          <template #body="{ data }">
            <NuxtLink
              :to="{
                name: 'admin-season-season-applications-company-edit',
                params: {
                  season: data.forSeason.uid,
                  company: data.forCompany.uid,
                },
              }"
            >
              Edit
            </NuxtLink>
          </template>
        </Column>
        <template #expansion="{ data }">
          <div :class="$style.expansion">
            <div :class="$style.expansionRow">
              <strong>Industrija:</strong>
              <p-chip :label="data.forCompany.industry.name" />
            </div>
            <div v-if="data.talk" :class="$style.expansionRow">
              <strong>Talk:</strong>
              <div>
                <p-chip :label="data.talk.category.name" class="mr-2" />
                <em v-text="data.talk.titleEn" />
              </div>
            </div>
            <div v-if="data.workshop" :class="$style.expansionRow">
              <strong>Workshop:</strong>
              <em v-text="data.workshop.titleEn" />
            </div>
            <div v-if="data.wantsCocktail" :class="$style.expansionRow">
              <strong>Cocktail:</strong>
              <div>
                <em v-if="data.cocktail?.name" v-text="data.cocktail.name" />
                <em v-if="data.cocktail?.name && data.cocktail?.type?.type"> : </em>
                <em v-if="data.cocktail?.type?.type" v-text="data.cocktail.type.type" />
              </div>
            </div>
            <div v-if="data.wantsPanel" :class="$style.expansionRow">
              <strong>Panel:</strong>
              <span>Yes</span>
            </div>
          </div>
        </template>
      </DataTable>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    sortObject,
  } from "rambdax";
  import Chip from "primevue/chip";
  import Tooltip from "primevue/tooltip";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import {
    FilterMatchMode,
    FilterService,
  } from "primevue/api";
  import InputText from "primevue/inputtext";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    useQuery,
    useRoute,
    ref,
    unref,
    onMounted,
  } from "#imports";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import useTitle from "~/composables/useTitle";
  import {
    AdminCompanyApplications,
    type IAdminCompanyApplicationsQuery,
    type IAdminCompanyApplicationsQueryVariables,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminSeasonApplications",

    components: {
      AppMaxWidthContainer,
      DataTable,
      Column,
      InputText,
      PChip: Chip,
    },

    directives: {
      tooltip: Tooltip,
    },

    async setup() {
      useTitle("Admin | Company Applications", false);

      const route = useRoute();
      const industriesStore = useIndustriesStore();
      const talkCategoriesStore = useTalkCategoriesStore();

      const res = await useQuery<IAdminCompanyApplicationsQuery, IAdminCompanyApplicationsQueryVariables>({
        query: AdminCompanyApplications,
        variables: {
          season: route.params.season as string,
        },
      })().then((res) => res?.data);

      industriesStore.setIndustries(res?.industries);
      talkCategoriesStore.setTalkCategories(res?.talkCategories);

      const booths = ref(Object.fromEntries((res?.booths || []).map((b) => [ b.key, b.name ])));
      const companyApplications = ref(res?.companyApplications || []);

      const isMobile = ref(false);

      onMounted(() => {
        isMobile.value = 768 > window.innerWidth;
        window.addEventListener("resize", () => {
          isMobile.value = 768 > window.innerWidth;
        });
      });

      const statistics = {
        company: {
          byIndustry: Object.fromEntries(industriesStore.industries.map((industry) => [ industry, 0 ])),
        },
        booths: Object.fromEntries((res?.booths || []).filter((b) => b.key).map((b) => [ b.key, 0 ])) as Record<string, number>,
        talks: Object.fromEntries((res?.talkCategories || []).map((c) => [ c.name, 0 ])),
        workshops: 0,
        panels: 0,
        cocktails: 0,
      };
      for (const application of unref(companyApplications) ?? []) {
        const {
          booth,
          talk,
          workshop,
          wantsPanel,
          wantsCocktail,
          forCompany: company,
        } = application;

        statistics.company.byIndustry[company!.industry!.name] += 1;

        if (booth) {
          statistics.booths[booth] += 1;
        }

        if (talk) {
          statistics.talks[talk.category.name] += 1;
        }

        if (workshop) {
          statistics.workshops += 1;
        }

        if (wantsCocktail) {
          statistics.cocktails += 1;
        }

        if (wantsPanel) {
          statistics.panels += 1;
        }
      }
      statistics.company.byIndustry = sortObject((_a, _b, a, b) => b - a, statistics.company.byIndustry);
      statistics.talks = sortObject((_a, _b, a, b) => b - a, statistics.talks);

      const filters = ref({
        global: { value: null as string | null, matchMode: "$global" },
        "forCompany.brandName": { value: null, matchMode: FilterMatchMode.CONTAINS },
        "forCompany.industry.name": { value: null, matchMode: FilterMatchMode.CONTAINS },
      });

      const dt = ref<DataTable | null>(null);
      const expandedRows = ref<Record<string, boolean>>({});

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

      return {
        statistics,
        booths,
        companyApplications,
        filters,
        dt,
        isMobile,
        expandedRows,
        exportCSV() {
          const $dt = unref(dt);

          if (!$dt) {
            return;
          }

          $dt.exportCSV();
        },
        expandAll() {
          expandedRows.value = unref(companyApplications).reduce((acc: Record<string, boolean>, p) => {
            acc[p.forCompany!.uid] = true;
            return acc;
          }, {} as Record<string, boolean>);
        },
        collapseAll() {
          expandedRows.value = {} as Record<string, boolean>;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    .statistics {
      display: flex;
      flex-direction: column;
      width: fit-content;
      margin-left: 1.5rem;
      padding-left: .875rem;
      border-left: 2px solid #{$fer-yellow};
      gap: 1rem;

      > div {

        > strong {

          &::after {
            content: ": ";
          }
        }

        > dl {
          margin: 0 1rem;

          dd {
            margin: 0;

            > span {
              font-style: italic;

              &::after {
                content: ": ";
              }
            }
          }
        }
      }
    }
  }

  .tableHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
    }
  }

  .buttonGroup {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      width: 100%;

      > button {
        flex: 1;
      }
    }
  }

  .searchWrapper {
    position: relative;
    display: inline-flex;
    align-items: center;

    @media (max-width: 768px) {
      width: 100%;
    }

    > i {
      position: absolute;
      left: 0.75rem;
      color: #6c757d;
      z-index: 1;
    }
  }

  .searchInput {
    padding-left: 2.5rem;
    min-width: min(300px, 100%);

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  .textTruncate {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 768px) {
      max-width: 150px;
    }
  }

  .expansion {
    padding: 1rem;
    background: rgba(0, 0, 0, 0.02);
  }

  .expansionRow {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: center;

    &:last-child {
      margin-bottom: 0;
    }

    > strong {
      min-width: 100px;
      color: #666;
    }
  }

  .hideOnMobile {
    @media (max-width: 768px) {
      display: none !important;
    }
  }
</style>

<style lang="scss">
  // Global styles for DataTable expander button
  .p-datatable {
    .p-row-toggler {
      background: #2c3e50 !important;
      color: white !important;
      border: none !important;
      width: 2rem !important;
      height: 2rem !important;

      &:hover {
        background: #34495e !important;
      }

      &:focus {
        box-shadow: 0 0 0 0.2rem rgba(44, 62, 80, 0.5) !important;
      }
    }
  }
</style>
