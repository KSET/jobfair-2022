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
      <ul>
        <li
          v-for="application in companyApplications"
          :key="JSON.stringify(application)"
          class="mt-2"
        >
          <span
            class="mr-2 p-1 px-2 border-round"
            style="background-color: rgb(0 0 0 / 15%);"
            v-text="application.forCompany.industry.name"
          />
          <strong v-text="application.forCompany.brandName" />
          <NuxtLink
            :to="{
              name: 'admin-season-season-applications-company-edit',
              params: {
                season: application.forSeason.uid,
                company: application.forCompany.uid,
              },
            }"
            class="ml-2"
          >
            Edit
          </NuxtLink>
          <ul>
            <li v-if="application.booth" class="mt-3 mb-2">
              <strong>Booth</strong>:
              <kbd
                class="p-1 px-2 border-round"
                style="background: rgb(62 13 64 / 30%);"
                v-text="booths[application.booth]"
              />
            </li>
            <li v-if="application.talk" class="mt-3 mb-2">
              <strong>Talk</strong>:
              <kbd
                class="mr-1 p-1 px-2 border-round"
                style="background: rgb(13 62 64 / 30%);"
                v-text="application.talk.category.name"
              />
              <em v-text="application.talk.titleEn" />
            </li>
            <li v-if="application.workshop">
              <strong>Workshop</strong>: <em v-text="application.workshop.titleEn" />
            </li>
            <li v-if="application.wantsCocktail">
              <strong>
                Cocktail
                <i class="ml-2 pi pi-check" />
              </strong>
            </li>
            <li v-if="application.wantsPanel">
              <strong>
                Panel
                <i class="ml-2 pi pi-check" />
              </strong>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    ref,
    unref,
  } from "vue";
  import {
    sortObject,
  } from "rambdax";
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
