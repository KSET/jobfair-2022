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
      <h2>Korisnici</h2>

      <dl>
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-users' }">
              Uredi
            </nuxt-link>
          </strong>
        </dd>
      </dl>
    </div>

    <div>
      <h2>Firme</h2>

      <dl>
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-companies' }">
              Uredi
            </nuxt-link>
          </strong>
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
              :to="{ name: 'admin-season-season-applications', params: { season: season.uid } }"
            >
              Prijave
            </nuxt-link>
          </li>
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
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-schedule', params: { season: season.uid } }"
            >
              Raspored
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-reservations', params: { season: season.uid } }"
            >
              Rezervacije
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-stats', params: { season: season.uid } }"
            >
              Statistike
            </nuxt-link>
          </li>
        </ul>
      </fieldset>
    </div>
  </app-max-width-container>
</template>
<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import Tooltip from "primevue/tooltip";
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

      return {
        industries,
        talkCategories,
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
                  showParticipantsFrom
                  showParticipantsUntil
                  showPartnersFrom
                  showPartnersUntil
                  showSponsorsFrom
                  showSponsorsUntil
                  eventFrom
                  eventUntil
                  feedbackFrom
                  feedbackUntil
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
