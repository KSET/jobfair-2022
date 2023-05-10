<template>
  <app-max-width-container :class="$style.container">
    <h1>
      Admin
    </h1>

    <div>
      <h2>Prijevodi</h2>

      <dl>
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-translations' }">
              Uredi
            </nuxt-link>
          </strong>
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
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-users-event-log' }">
              Pregledaj logove
            </nuxt-link>
          </strong>
        </dd>
        <dd>
          <strong>
            <nuxt-link
              :to="{ name: 'admin-users-scanners' }"
            >
              Ljudi koji skeniraju
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
      <h2>Novosti</h2>

      <dl>
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-news' }">
              Uredi
            </nuxt-link>
          </strong>
        </dd>
      </dl>
    </div>

    <div>
      <h2>PR</h2>

      <dl>
        <dd>
          <strong>
            <nuxt-link :to="{ name: 'admin-pr-qr' }">
              Generiraj Job Fair QR kod
            </nuxt-link>
          </strong>
        </dd>
      </dl>
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
      <h2>Sezone</h2>

      <fieldset
        v-for="season in seasons"
        :key="season.uid"
        class="mb-3"
      >
        <legend v-text="season.name" />

        <Panel
          :collapsed="!season.selected"
        >
          <template #header>
            <strong>
              Uredi datume
            </strong>

            <p-button
              icon="pi pi-chevron-down"
              class="p-button-text p-button-rounded p-button-secondary ml-auto"
              :class="{
                [$style.toggleButton]: true,
                [$style.toggleButtonActive]: season.selected,
              }"
              @click="season.selected = !season.selected"
            />
          </template>
          <edit-season
            :season="season"
            :uid="season.uid"
            @delete="refreshSeasons"
            @save="refreshSeasons"
          />
        </Panel>

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
              :to="{ name: 'admin-season-season-applications-talk-categories', params: { season: season.uid } }"
            >
              Kategorije talkova
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
        </ul>

        <h2>Event</h2>
        <ul>
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
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-applications-feedback', params: { season: season.uid } }"
            >
              Feedback
            </nuxt-link>
          </li>
        </ul>

        <h2>PR</h2>
        <ul>
          <li>
            <nuxt-link
              :to="{ name: 'admin-season-season-press-releases', params: { season: season.uid } }"
            >
              <translated-text trans-key="press.for-media" />
            </nuxt-link>
          </li>
        </ul>
      </fieldset>

      <fieldset>
        <legend>New</legend>

        <edit-season
          @save="refreshSeasons"
        />
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
  import Panel from "primevue/panel";
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
  import EditableField from "~/components/admin/util/editable-field.vue";
  import EditSeason from "~/components/page/admin/edit-season.vue";

  export default defineComponent({
    name: "PageAdminHome",

    components: {
      EditSeason,
      EditableField,
      AppMaxWidthContainer,
      Panel,
    },

    directives: {
      tooltip: Tooltip,
    },

    async setup() {
      useTitle("Admin", false);

      const industriesStore = useIndustriesStore();

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

      const res = await useQuery<IAdminInitialDataQuery, IAdminInitialDataQueryVariables>({
        query: AdminInitialData,
      })().then((res) => res?.data);

      industriesStore.setIndustries(res?.industries);

      const seasons = ref((res?.seasons || []).map((x) => ({ ...x, selected: false })).map(reactive));

      return {
        industries,
        seasons,
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

          seasons.value = (resp?.data?.seasons || []).map((x) => reactive({ ...x, selected: false }));
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    .toggleButton {
      transition-property: transform;

      &.toggleButtonActive {
        transform: rotate(180deg);
      }
    }

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
