<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="account-manager.companies.title" />
    </h1>

    <div
      v-if="isAdmin"
      :class="$style.managerPicker"
    >
      <label for="account-manager-picker">
        <translated-text trans-key="account-manager.select-manager" />
      </label>
      <Dropdown
        v-model="selectedManagerUid"
        :options="managers"
        input-id="account-manager-picker"
        option-label="name"
        option-value="uid"
        filter
        @change="activeIndex = 0"
      />
    </div>

    <p v-if="0 === companies.length">
      <translated-text trans-key="account-manager.companies.empty" />
    </p>

    <TabView
      v-else
      v-model:activeIndex="activeIndex"
      lazy
      scrollable
    >
      <TabPanel
        v-for="company in companies"
        :key="`${ selectedManagerUid }--${ company.uid }`"
        :header="company.brandName"
      >
        <div :class="$style.toolbar">
          <nuxt-link :to="{ name: 'account-manager-companies-vat-edit', params: { vat: company.vat } }">
            <p-button class="p-button-outlined" icon="pi pi-pencil">
              <translated-text trans-key="account-manager.company.edit-link" />
            </p-button>
          </nuxt-link>

          <!-- TODO UC 38 milestones: real data per company once milestones exist in the schema -->
          <div :class="$style.milestones">
            <small :class="$style.milestonesLabel">
              <translated-text trans-key="account-manager.milestones.title" />
            </small>
            <span
              v-for="milestone in milestones"
              :key="milestone"
              :class="$style.milestone"
            >
              <translated-text :trans-key="`account-manager.milestones.${ milestone }`" />
            </span>
          </div>
        </div>

        <Suspense>
          <page-admin-company-application-edit
            :company-uid="company.uid"
            :season-uid="company.seasonUid"
            account-manager
          />
        </Suspense>
      </TabPanel>
    </TabView>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import Dropdown from "primevue/dropdown";
  import {
    useRoute,
    useRouter,
  } from "vue-router";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import PageAdminCompanyApplicationEdit from "~/pages/admin/season/[season]/applications/[company]/edit.vue";
  import {
    computed,
    defineComponent,
    ref,
    watch,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    useUserStore,
  } from "~/store/user";

  type QCompanyAccountManager = {
    createdAt: string,
    user: { uid: string, name: string, email: string, },
    company: { uid: string, vat: string, brandName: string, legalName: string, },
    season: { uid: string, name: string, },
  };

  type Manager = QCompanyAccountManager["user"];

  type TabCompany = QCompanyAccountManager["company"] & {
    seasonUid: string,
  };

  export default defineComponent({
    name: "PageAccountManagerHome",

    components: {
      AppMaxWidthContainer,
      TranslatedText,
      TabView,
      TabPanel,
      Dropdown,
      PageAdminCompanyApplicationEdit,
    },

    async setup() {
      useTitle("account-manager.companies.title");

      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();
      const isAdmin = computed(() => userStore.isAdmin);

      type QData = {
        companyAccountManagers: QCompanyAccountManager[],
      };
      type QArgs = never;
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query AccountManagerCompanies {
            companyAccountManagers {
              createdAt
              user {
                uid
                name
                email
              }
              company {
                uid
                vat
                brandName
                legalName
              }
              season {
                uid
                name
              }
            }
          }
        `,
      })().then((resp) => resp?.data);

      const links = resp?.companyAccountManagers ?? [];

      const managersByUid = new Map<string, Manager>();
      for (const link of links) {
        managersByUid.set(link.user.uid, link.user);
      }
      const managers =
        [ ...managersByUid.values() ]
          .sort((a, b) => a.name.localeCompare(b.name))
      ;

      const ownUid = userStore.user?.uid ?? null;
      const selectedManagerUid = ref<string | null>(
        managersByUid.has(ownUid ?? "")
          ? ownUid
          : (managers[0]?.uid ?? null),
      );

      const companies = computed<TabCompany[]>(() => {
        const byUid = new Map<string, TabCompany>();

        for (const link of links) {
          if (isAdmin.value && link.user.uid !== selectedManagerUid.value) {
            continue;
          }

          byUid.set(link.company.uid, {
            ...link.company,
            seasonUid: link.season.uid,
          });
        }

        return [ ...byUid.values() ].sort((a, b) => a.brandName.localeCompare(b.brandName));
      });

      const initialIndex = companies.value.findIndex((company) => company.vat === route.query.company);
      const activeIndex = ref(Math.max(0, initialIndex));

      watch(activeIndex, (index) => {
        const company = companies.value[index];

        if (!company) {
          return;
        }

        void router.replace({
          query: {
            ...route.query,
            company: company.vat,
          },
        });
      });

      const milestones = [
        "talk",
        "workshop",
        "panel",
        "booth",
        "hot-talk",
        "king-of-cocktails",
        "invoice-sent",
        "offer-sent",
      ];

      return {
        isAdmin,
        managers,
        selectedManagerUid,
        companies,
        activeIndex,
        milestones,
      };
    },
  });
</script>

<style lang="scss" module>
  .managerPicker {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .75rem;
    margin-bottom: 1.5rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .milestones {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .5rem;
    opacity: .4;
  }

  .milestonesLabel {
    font-weight: bold;
  }

  .milestone {
    padding: .25rem .5rem;
    border: 1px dashed currentcolor;
    border-radius: 4px;
    font-size: .85rem;
  }
</style>
