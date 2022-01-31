<template>
  <app-max-width-container>
    <h1>
      Admin
    </h1>

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
          <edit-industry
            :disabled="info.industriesLoading"
            :model-value="industry"
            @save="handleIndustryEdit(industry, $event)"
          />
        </li>
        <li>
          <form @submit.prevent="handleCategorySubmit">
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
      <h2>Firme</h2>
      <ul>
        <li
          v-for="company of companies"
          :key="company.uid"
        >
          <p-chip :label="company.industry.name" class="mr-2" />
          <strong v-tooltip.top="company.legalName" v-text="company.brandName" />
          <a :href="$router.resolve({ name: 'admin-company-vat-edit', params: { vat: company.vat } }).href">
            Edit
          </a>
          <ul>
            <li
              v-for="member in company.members"
              :key="member.uid"
              v-text="member.name"
            />
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
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import Tooltip from "primevue/tooltip";
  import Chip from "primevue/chip";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import EditIndustry from "~/components/admin/industries/edit-industry.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    ICompany,
    IFile,
    IIndustry,
    IPressRelease,
    IUser,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminHome",

    components: {
      EditIndustry,
      AppMaxWidthContainer,
      PChip: Chip,
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
      });

      const industriesDelta = ref([] as string[]);

      const industries = computed({
        get: () => industriesStore.industries,
        set: (val) => industriesDelta.value = val,
      });

      type QCompany = Pick<ICompany,
                           "vat"
                             | "legalName"
                             | "brandName">;
      type QIndustry = Pick<IIndustry, "name">;
      type QUser = Pick<IUser, "name" | "uid">;
      type QPressRelease = Pick<IPressRelease,
                                "title"
                                  | "uid"
                                  | "published"> & {
        file: Pick<IFile, "uid">,
      };
      type QueryData = {
        industries: Pick<IIndustry, "name">[],
        companies: (QCompany & { industry: QIndustry, members: QUser, })[],
        pressReleases: QPressRelease[],
      };
      type QueryArgs = never;
      const res = await useQuery<QueryData, QueryArgs>({
        query: gql`
        query {
            industries {
                name
            }
            companies(orderBy: { legalName: asc }) {
                vat
                legalName
                brandName
                industry {
                    name
                }
                members {
                    uid
                    name
                }
            }
            pressReleases(orderBy: { published: desc }) {
                uid
                title
                published
                file {
                    uid
                }
            }
        }
        `,
      })().then((res) => res?.data);

      industriesStore.setIndustries(res?.industries);

      const companies = ref(res?.companies);
      return {
        industries,
        companies,
        pressReleases: (res?.pressReleases || [] as QPressRelease[]).map((item) => ({ ...item, published: new Date(String(item.published)) })),
        info,
        formatDate: (date: Date) => `${ date.getDate() }. ${ date.getMonth() + 1 }. ${ date.getFullYear() }.`,
        async handleCategorySubmit() {
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
      };
    },
  });
</script>
