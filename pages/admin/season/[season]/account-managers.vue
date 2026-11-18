<template>
  <app-max-width-container>
    <div>
      <nuxt-link :to="{ name: 'admin' }">
        &larr;
        <translated-text trans-key="admin.account-managers.back" />
      </nuxt-link>
    </div>

    <h1>
      <translated-text trans-key="admin.account-managers.title" />
      <template v-if="seasonName">
        &mdash; {{ seasonName }}
      </template>
    </h1>

    <div :class="$style.toolbar">
      <label :class="$style.toggle">
        <InputSwitch v-model="byManager" />
        <translated-text trans-key="admin.account-managers.view-by-manager" />
      </label>

      <p-button
        class="p-button-danger p-button-outlined ml-auto"
        :disabled="isDeleting || 0 === links.length"
        @click="handleDeleteAll"
      >
        <i
          :class="isDeleting ? 'pi-spin pi-spinner' : 'pi-trash'"
          class="pi p-button-icon p-button-icon-left"
        />
        <span class="p-button-label">
          <translated-text trans-key="admin.account-managers.delete-all" />
        </span>
      </p-button>
    </div>

    <p v-if="0 === managers.length">
      <em>
        <translated-text trans-key="admin.account-managers.no-managers" />
      </em>
    </p>

    <DataTable
      v-if="!byManager"
      :value="rows"
      data-key="uid"
      row-hover
      responsive-layout="scroll"
    >
      <template #empty>
        <translated-text trans-key="admin.account-managers.no-participants" />
      </template>

      <Column field="brandName" sortable>
        <template #header>
          <translated-text trans-key="admin.account-managers.column.company" />
        </template>
        <template #body="{ data }">
          <nuxt-link :to="{ name: 'admin-companies-vat-edit', params: { vat: data.vat } }">
            <strong v-tooltip.top="data.legalName" v-text="data.brandName" />
          </nuxt-link>
        </template>
      </Column>

      <Column>
        <template #header>
          <translated-text trans-key="admin.account-managers.column.managers" />
        </template>
        <template #body="{ data }">
          <MultiSelect
            v-model="data.selected"
            :options="managers"
            option-label="email"
            option-value="uid"
            display="chip"
            filter
            :filter-fields="['email', 'name']"
            :disabled="data.isSaving"
            :class="$style.multiSelect"
          >
            <template #option="{ option }">
              <span>{{ option.name }} &lt;{{ option.email }}&gt;</span>
            </template>
            <template #chip="{ value }">
              <span class="p-multiselect-token-label">{{ managerLabel(value) }}</span>
            </template>
          </MultiSelect>
        </template>
      </Column>

      <Column header-style="width: 8rem">
        <template #body="{ data }">
          <p-button
            class="p-button-secondary"
            :loading="data.isSaving"
            @click="handleSave(data)"
          >
            <translated-text trans-key="form.save" />
          </p-button>
        </template>
      </Column>
    </DataTable>

    <div v-else>
      <p v-if="0 === byManagerGroups.length">
        <em>
          <translated-text trans-key="admin.account-managers.no-assignments" />
        </em>
      </p>
      <section
        v-for="group in byManagerGroups"
        :key="group.user.uid"
        :class="$style.managerGroup"
      >
        <h3>
          <span v-text="group.user.name" />
          &nbsp;
          <small><em v-text="group.user.email" /></small>
        </h3>
        <ul>
          <li
            v-for="company in group.companies"
            :key="company.uid"
          >
            <nuxt-link :to="{ name: 'admin-companies-vat-edit', params: { vat: company.vat } }">
              <strong v-text="company.brandName" />
            </nuxt-link>
            &nbsp;
            <small v-text="company.legalName" />
          </li>
        </ul>
      </section>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    gql,
  } from "@urql/core";
  import {
    useRoute,
  } from "vue-router";
  import {
    useToast,
  } from "primevue/usetoast";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import MultiSelect from "primevue/multiselect";
  import InputSwitch from "primevue/inputswitch";
  import Tooltip from "primevue/tooltip";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    computed,
    defineComponent,
    reactive,
    ref,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    type ICompany,
    type IUser,
  } from "~/graphql/schema";

  type QCompanyAccountManager = {
    createdAt: string,
    user: { uid: string, name: string, email: string, },
    company: { uid: string, vat: string, brandName: string, legalName: string, },
    season: { uid: string, name: string, },
  };

  type QParticipant = Pick<ICompany, "uid" | "vat" | "brandName" | "legalName">;
  type QUser = Pick<IUser, "uid" | "name" | "email">;
  type QManager = QCompanyAccountManager["user"];

  type Row = QParticipant & {
    selected: string[],
    isSaving: boolean,
  };

  export default defineComponent({
    name: "PageAdminSeasonAccountManagers",

    components: {
      AppMaxWidthContainer,
      TranslatedText,
      DataTable,
      Column,
      MultiSelect,
      InputSwitch,
    },

    directives: {
      tooltip: Tooltip,
    },

    async setup() {
      useTitle("admin.account-managers.title");

      const route = useRoute();
      const toast = useToast();
      const translationsStore = useTranslationsStore();
      const seasonsStore = useSeasonsStore();
      const t = (key: string) => translationsStore.translation(key);

      const season = route.params.season as string;

      type QData = {
        participants: QParticipant[],
        companyAccountManagers: QCompanyAccountManager[],
        accountManagerUsers: QUser[],
      };
      type QArgs = {
        season: string,
      };
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query AdminSeasonAccountManagers($season: String!) {
            participants(season: $season) {
              uid
              vat
              brandName
              legalName
            }
            companyAccountManagers(season: $season) {
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
            accountManagerUsers {
              uid
              name
              email
            }
          }
        `,
        variables: {
          season,
        },
      })().then((resp) => resp?.data);

      const links = ref<QCompanyAccountManager[]>(resp?.companyAccountManagers ?? []);

      const managerMap = new Map<string, QManager>();
      for (const user of resp?.accountManagerUsers ?? []) {
        managerMap.set(user.uid, user);
      }
      const managers = [ ...managerMap.values() ].sort((a, b) => a.name.localeCompare(b.name));
      const managerLabel = (uid: string) => {
        const manager = managerMap.get(uid);

        return manager ? `${ manager.name } <${ manager.email }>` : uid;
      };

      const selectedFor = (companyUid: string) =>
        links.value
          .filter((link) => link.company.uid === companyUid && managerMap.has(link.user.uid))
          .map((link) => link.user.uid)
      ;

      const rowCompanies = new Map<string, QParticipant>();
      for (const company of resp?.participants ?? []) {
        rowCompanies.set(company.uid, company);
      }
      for (const { company } of links.value) {
        if (!rowCompanies.has(company.uid)) {
          rowCompanies.set(company.uid, {
            uid: company.uid,
            vat: company.vat,
            brandName: company.brandName,
            legalName: company.legalName,
          });
        }
      }

      const rows = reactive<Row[]>(
        [ ...rowCompanies.values() ]
          .sort((a, b) => a.brandName.localeCompare(b.brandName))
          .map((company) => ({
            ...company,
            selected: selectedFor(company.uid),
            isSaving: false,
          })),
      );

      const byManagerGroups = computed(() => {
        const groups = new Map<string, { user: QManager, companies: QCompanyAccountManager["company"][], }>();

        for (const link of links.value) {
          const group = groups.get(link.user.uid);

          if (group) {
            group.companies.push(link.company);
            continue;
          }

          groups.set(link.user.uid, {
            user: link.user,
            companies: [ link.company ],
          });
        }

        return (
          [ ...groups.values() ]
            .sort((a, b) => a.user.name.localeCompare(b.user.name))
            .map((group) => ({
              ...group,
              companies: group.companies.sort((a, b) => a.brandName.localeCompare(b.brandName)),
            }))
        );
      });

      const seasonName = computed(() => seasonsStore.season?.name ?? "");

      type SetData = {
        setCompanyAccountManagers: QCompanyAccountManager[] | null,
      };
      type SetArgs = {
        season: string,
        company: string,
        users: string[],
      };
      const setMutation = useMutation<SetData, SetArgs>(gql`
        mutation SetCompanyAccountManagers($season: String!, $company: String!, $users: [String!]!) {
          setCompanyAccountManagers(season: $season, company: $company, users: $users) {
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
      `);

      type DeleteData = {
        deleteCompanyAccountManagersForSeason: number,
      };
      type DeleteArgs = {
        season: string,
      };
      const deleteMutation = useMutation<DeleteData, DeleteArgs>(gql`
        mutation DeleteCompanyAccountManagersForSeason($season: String!) {
          deleteCompanyAccountManagersForSeason(season: $season)
        }
      `);

      const byManager = ref(false);
      const isDeleting = ref(false);

      return {
        seasonName,
        managers,
        managerLabel,
        rows,
        links,
        byManager,
        byManagerGroups,
        isDeleting,
        async handleSave(row: Row) {
          row.isSaving = true;
          const result = await setMutation({
            season,
            company: row.uid,
            users: [ ...row.selected ],
          }).then((resp) => resp?.data?.setCompanyAccountManagers ?? null);
          row.isSaving = false;

          if (!result) {
            toast.add({
              severity: "error",
              summary: t("admin.account-managers.save.error"),
              closable: true,
              life: 5000,
            });
            return;
          }

          links.value = [
            ...links.value.filter((link) => link.company.uid !== row.uid),
            ...result,
          ];
          row.selected = result.map((link) => link.user.uid);

          toast.add({
            severity: "success",
            summary: t("admin.account-managers.save.success"),
            closable: true,
            life: 3000,
          });
        },
        async handleDeleteAll() {
          if (!window.confirm(t("admin.account-managers.delete-all.confirm"))) {
            return;
          }

          isDeleting.value = true;
          const count = await deleteMutation({
            season,
          }).then((resp) => resp?.data?.deleteCompanyAccountManagersForSeason ?? null);
          isDeleting.value = false;

          if (null === count) {
            toast.add({
              severity: "error",
              summary: t("admin.account-managers.delete-all.error"),
              closable: true,
              life: 5000,
            });
            return;
          }

          links.value = [];
          for (const row of rows) {
            row.selected = [];
          }

          toast.add({
            severity: "success",
            summary: `${ t("admin.account-managers.delete-all.success") }: ${ count }`,
            closable: true,
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    gap: 1rem;

    > :global(.p-button) {
      flex-shrink: 0;
    }
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    gap: .5rem;
  }

  .multiSelect {
    width: 100%;
    max-width: 30rem;
  }

  .managerGroup {
    margin-bottom: 1.5rem;
  }
</style>
