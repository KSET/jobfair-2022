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
      <p-button icon="pi pi-external-link" label="Export" @click="exportCSV()" />


      <DataTable
        ref="dt"
        :lazy="true"
        :value="companyApplications"
        :exportable="true"
        :responsive-layout="'scroll'"
        striped-rows
        scrollable
      >
        <Column field="forCompany.industry.name" header="Industry" />
        <Column field="forCompany.brandName" header="Brand Name" />
        <Column field="booth" header="Booth">
          <template #body="{ data }">
            <span v-if="data.booth" class="p-1 px-2 border-round leading-4" style="background: rgb(62 13 64 / 30%)">
              {{ booths[data.booth] }}
            </span>
          </template>
        </Column>
        <Column field="talk.titleEn" header="Talk Title">
          <template #body="{ data }">
            <span v-if="data.talk">
              <kbd class="mr-1 p-1 px-2 border-round" style="background: rgb(13 62 64 / 30%)">
                {{ data.talk.category.name }}
              </kbd>
              <em>{{ data.talk.titleEn }}</em>
            </span>
          </template>
        </Column>
        <Column field="workshop.titleEn" header="Workshop Title">
          <template #body="{ data }">
            <em v-if="data.workshop">{{ data.workshop.titleEn }}</em>
          </template>
        </Column>
        <Column field="wantsCocktail" header="Wants Cocktail">
          <template #body="{ data }">
            <i v-if="data.wantsCocktail" class="pi pi-check" />
          </template>
        </Column>
        <Column field="wantsPanel" header="Wants Panel">
          <template #body="{ data }">
            <i v-if="data.wantsPanel" class="pi pi-check" />
          </template>
        </Column>
        <Column header="Actions">
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
      </DataTable>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    ref,
    unref,
    nextTick,
  } from "vue";
  import {
    sortObject,
  } from "rambdax";
  import {
    unparse,
  } from "papaparse";
  import type {
    UnparseConfig,
  } from "papaparse";

  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    defineComponent,
    useQuery,
    useRoute,
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
    },

    async setup() {
      useTitle("Admin | Company Applications", false);

      const route = useRoute();
      const industriesStore = useIndustriesStore();
      const talkCategoriesStore = useTalkCategoriesStore();

      const dt = ref<DataTable | null>(null);

      const res = await useQuery<IAdminCompanyApplicationsQuery, IAdminCompanyApplicationsQueryVariables>({
        query: AdminCompanyApplications,
        variables: {
          season: route.params.season as string,
        },
      })().then((res) => res?.data);

      industriesStore.setIndustries(res?.industries);
      talkCategoriesStore.setTalkCategories(res?.talkCategories);

      const booths = ref(Object.fromEntries((res?.booths || []).map((b) => [ b.key, b.name ])));

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
      for (const application of unref(res?.companyApplications) ?? []) {
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

      return {
        statistics,
        booths,
        companyApplications: res?.companyApplications || [],
        dt,
        exportCSV() {
          // const $dt = unref(dt);

          // if (!$dt) {
          //   console.error("DataTable reference is null.");
          //   return;
          // }

          // // Prepare custom exportable data
          // const exportData = companyApplications;

          // console.log("Export Data:", exportData);

          // // Use the exportCSV method with options and data
          // const csv = unparse(exportData, {} as UnparseConfig);
          // const blob = new Blob([ csv ], { type: "text/csv;charset=utf-8;" });
          // const link = document.createElement("a");
          // link.href = URL.createObjectURL(blob);
          // link.download = "export_companyApplications.csv";
          // link.click();

          // // Log the export data for debugging purposes
          // console.log("Export Data:", exportData);
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
</style>
