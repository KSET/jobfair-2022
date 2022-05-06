<template>
  <app-max-width-container :class="$style.container">
    <h1>
      Admin
    </h1>

    <div>
      <h2>Prijevodi</h2>

      <dl>
        <dd>
          <h3>
            <nuxt-link :to="{ name: 'admin-translations' }">
              Uredi
            </nuxt-link>
          </h3>
        </dd>
      </dl>
    </div>

    <div>
      <h2>Press</h2>
      <ul>
        <li>
          <h3>Press Releases</h3>
          <ul>
            <li
              v-for="pressRelease in pressReleases"
              :key="pressRelease.uid"
            >
              <time
                :datetime="pressRelease.published.toISOString()"
                :title="pressRelease.published.toLocaleDateString()"
                v-text="formatDate(pressRelease.published)"
              />
              <span v-text="pressRelease.title" />
              <a :href="$router.resolve({ name: 'admin-press-releases-uid-edit', params: { uid: pressRelease.uid } }).href">
                Edit
              </a>
            </li>
            <li>
              <nuxt-link :to="{ name: 'admin-press-releases-new' }">
                New
              </nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div>
      <h2>Industrije</h2>

      <ul>
        <li
          v-for="industry in industries"
          :key="industry"
        >
          <editable-field
            :disabled="info.industriesLoading"
            :model-value="industry"
            @save="handleIndustryEdit(industry, $event)"
          />
        </li>
        <li>
          <form @submit.prevent="handleIndustrySubmit">
            <input
              v-model="info.newIndustry"
              :disabled="info.industriesLoading"
              type="text"
            >
            <button
              :disabled="info.industriesLoading"
              class="ml-3"
            >
              Create
            </button>
          </form>
        </li>
      </ul>
    </div>

    <div>
      <h2>Kategorije talkova</h2>

      <ul>
        <li
          v-for="talkCategory in talkCategories"
          :key="talkCategory"
        >
          <editable-field
            :disabled="info.talkCategoriesLoading"
            :model-value="talkCategory"
            @save="handleTalkCategoryEdit(talkCategory, $event)"
          />
        </li>
        <li>
          <form @submit.prevent="handleTalkCategorySubmit">
            <input
              v-model="info.newTalkCategory"
              :disabled="info.talkCategoriesLoading"
              type="text"
            >
            <button
              :disabled="info.talkCategoriesLoading"
              class="ml-3"
            >
              Create
            </button>
          </form>
        </li>
      </ul>
    </div>

    <div>
      <h2>Sezone</h2>

      <fieldset>
        <legend>New</legend>

        <edit-season
          @save="refreshSeasons"
        />
      </fieldset>

      <fieldset
        v-for="season in seasons"
        :key="season.uid"
        class="mt-3"
      >
        <legend v-text="season.name" />

        <edit-season
          :season="season"
          :uid="season.uid"
          @delete="refreshSeasons"
          @save="refreshSeasons"
        />

        <hr>

        <h2>Prijave</h2>
        <ul>
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-applications-approval', params: { season: season.uid } }"
            >
              Odobri
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season', params: { season: season.uid } }"
            >
              Partneri i sponzori
            </nuxt-link>
          </li>
        </ul>
      </fieldset>
    </div>

    <div>
      <h2>Firme ({{ (companies || []).length }})</h2>
      <ul>
        <li
          v-for="company of companies"
          :key="company.uid"
        >
          <p-chip :label="company.industry.name" class="mr-2" />
          <strong v-tooltip.top="company.legalName" v-text="company.brandName" />
          <a :href="$router.resolve({ name: 'admin-companies-vat-edit', params: { vat: company.vat } }).href">
            Edit
          </a>
          <ul>
            <li
              v-for="member in company.members"
              :key="member.uid"
            >
              <span v-text="member.name" />
              -
              <em v-text="member.email" />
              &nbsp;
              <nuxt-link :to="{ name: 'admin-user-uid-edit', params: { uid: member.uid } }">
                Edit
              </nuxt-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div>
      <h2>Korisnici ({{ (users || []).length }})</h2>

      <ul>
        <li
          v-for="user in users"
          :key="user.uid"
        >
          <span v-text="user.name" />
          -
          <em v-text="user.email" />
          &nbsp;
          <nuxt-link :to="{ name: 'admin-user-uid-edit', params: { uid: user.uid } }">
            Edit
          </nuxt-link>
        </li>
      </ul>
    </div>

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
          <a
            :href="$router.resolve({
              name: 'admin-season-season-application-company-edit',
              params: {
                season: application.forSeason.uid,
                company: application.forCompany.uid,
              },
            }).href"
            class="ml-2"
          >Edit</a>
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
    computed,
    defineComponent,
    reactive,
    ref,
    unref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import Tooltip from "primevue/tooltip";
  import Chip from "primevue/chip";
  import {
    sortBy,
    sortObject,
  } from "rambdax";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    AdminInitialData,
    IAdminInitialDataQueryVariables,
    IAdminInitialDataQuery,
  } from "~/graphql/schema";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import EditableField from "~/components/admin/util/editable-field.vue";
  import EditSeason from "~/components/page/admin/edit-season.vue";

  export default defineComponent({
    name: "PageAdminHome",

    components: {
      EditSeason,
      EditableField,
      AppMaxWidthContainer,
      PChip: Chip,
    },

    directives: {
      tooltip: Tooltip,
    },

    async setup() {
      useTitle("Admin", false);

      const industriesStore = useIndustriesStore();
      const talkCategoriesStore = useTalkCategoriesStore();

      const info = reactive({
        newIndustry: "",
        industriesLoading: false,
        newTalkCategory: "",
        talkCategoriesLoading: false,
      });

      const industriesDelta = ref([] as string[]);
      const industries = computed({
        get: () => industriesStore.industries,
        set: (val) => industriesDelta.value = val,
      });

      const talkCategoriesDelta = ref([] as string[]);
      const talkCategories = computed({
        get: () => talkCategoriesStore.talkCategories,
        set: (val) => talkCategoriesDelta.value = val,
      });

      const res = await useQuery<IAdminInitialDataQuery, IAdminInitialDataQueryVariables>({
        query: AdminInitialData,
      })().then((res) => res?.data);

      industriesStore.setIndustries(res?.industries);
      talkCategoriesStore.setTalkCategories(res?.talkCategories);

      const seasons = ref((res?.seasons || []).map(reactive));

      const companies = ref(res?.companies);
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
        industries,
        talkCategories,
        booths,
        companyApplications: res?.companyApplications || [],
        companies,
        users: sortBy<NonNullable<IAdminInitialDataQuery["users"]>[0]>((u) => new Date(u.createdAt as string), res?.users || []),
        seasons,
        pressReleases: (res?.pressReleases || [] as NonNullable<IAdminInitialDataQuery["pressReleases"]>).map((item) => ({
          ...item,
          published: new Date(String(item.published)),
        })),
        info,
        formatDate: (date: Date) => `${ date.getDate() }. ${ date.getMonth() + 1 }. ${ date.getFullYear() }.`,
        async handleIndustrySubmit() {
          info.industriesLoading = true;
          const resp = await industriesStore.createIndustry(info.newIndustry);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await industriesStore.fetchIndustries();
            info.newIndustry = "";
          }
          info.industriesLoading = false;
        },
        async handleIndustryEdit(oldName: string, newName: string) {
          info.industriesLoading = true;
          const resp = await industriesStore.renameIndustry(oldName, newName);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await industriesStore.fetchIndustries();
          }
          info.industriesLoading = false;
        },
        async handleTalkCategorySubmit() {
          info.talkCategoriesLoading = true;
          const resp = await talkCategoriesStore.createTalkCategory(info.newTalkCategory);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await talkCategoriesStore.fetchTalkCategories();
            info.newTalkCategory = "";
          }
          info.talkCategoriesLoading = false;
        },
        async handleTalkCategoryEdit(oldName: string, newName: string) {
          info.talkCategoriesLoading = true;
          const resp = await talkCategoriesStore.renameTalkCategory(oldName, newName);
          if (!resp) {
            alert("Something went wrong. Please try again.");
          } else {
            await talkCategoriesStore.fetchTalkCategories();
          }
          info.talkCategoriesLoading = false;
        },
        async refreshSeasons() {
          const resp = await useQuery<{
            seasons: NonNullable<IAdminInitialDataQuery["seasons"]>,
          }, never>({
            query: gql`
            query {
              seasons(orderBy: { endsAt: desc }) {
                  uid
                  name
                  startsAt
                  endsAt
                  applicationsFrom
                  applicationsUntil
              }
            }
          `,
          })();

          seasons.value = (resp?.data?.seasons || []).map(reactive);
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
