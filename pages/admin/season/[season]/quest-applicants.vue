<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1 class="mb-3">
      Quest statistika
    </h1>

    <div>
      <NuxtLink :to="{ name: 'admin' }">
        <p-button severity="secondary" type="button">
          &larr; Natrag
        </p-button>
      </NuxtLink>
    </div>

    <div :class="$style.filter">
      <Dropdown
        v-model="selectedCompanyUid"
        :options="questCompanies"
        option-label="brandName"
        option-value="uid"
        filter
        placeholder="Odaberi firmu"
      />
    </div>

    <p v-if="!selectedCompanyUid" :class="$style.prompt">
      Odaberi firmu da vidiš statistiku.
    </p>

    <div v-else style="overflow-x: auto;">
      <p :class="$style.count">
        Broj skeniranih: <strong>{{ selectedCompanyApplicantCount }}</strong>
      </p>

      <DataTable
        :value="applicants"
        data-key="user.uid"
        paginator
        :rows="20"
        striped-rows
        responsive-layout="scroll"
        sort-field="points"
        :sort-order="-1"
      >
        <Column field="user.name" header="Ime" sortable />
        <Column field="user.email" header="Email" sortable />
        <Column field="user.phone" header="Telefon" sortable />
        <Column field="scannedAt" header="Skenirano" sortable>
          <template #body="{ data }">
            {{ data.scannedAt ? new Date(data.scannedAt).toLocaleString() : '' }}
          </template>
        </Column>
        <Column field="points" header="Bodovi" sortable />
      </DataTable>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import Dropdown from "primevue/dropdown";
  import {
    computed,
    ref,
    watch,
    useRoute,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    graphql,
  } from "~/graphql/client";

  useTitle("Quest statistika", false);

  const route = useRoute();
  const seasonUid = route.params.season as string;

  type QuestCompany = {
    uid: string,
    brandName: string,
    applicantCount: number,
  };

  type QuestApplicant = {
    user: {
      uid: string,
      name: string,
      email: string,
      phone: string | null,
    } | null,
    points: number,
    scannedAt: string | null,
  };

  const questCompanies = ref<QuestCompany[]>([]);
  const selectedCompanyUid = ref<string | null>(null);
  const applicants = ref<QuestApplicant[]>([]);

  const questCompaniesQuery = useQuery({
    query: graphql(/* GraphQL */`
      query QuestCompaniesWithStatsForAdmin($seasonUid: String!) {
        questCompaniesWithStats(seasonUid: $seasonUid) {
          company {
            uid
            brandName
          }
          applicantCount
        }
      }
    `),
    variables: { seasonUid },
  });

  const questApplicantsQuery = useQuery({
    query: graphql(/* GraphQL */`
      query QuestApplicants($seasonUid: String!, $companyUid: String!) {
        questApplicants(seasonUid: $seasonUid, companyUid: $companyUid) {
          user {
            uid
            name
            email
            phone
          }
          points
          scannedAt
        }
      }
    `),
    variables: computed(() => ({
      seasonUid,
      companyUid: selectedCompanyUid.value ?? "",
    })),
  });

  async function loadQuestCompanies() {
    const res = await questCompaniesQuery();
    type Row = {
      company: { uid: string, brandName: string, },
      applicantCount: number,
    };
    const rows = (res?.data?.questCompaniesWithStats ?? []) as Row[];
    questCompanies.value = rows.map((r) => ({
      uid: r.company.uid,
      brandName: r.company.brandName,
      applicantCount: r.applicantCount,
    }));
  }

  const selectedCompanyApplicantCount = computed(() => {
    const uid = selectedCompanyUid.value;
    if (!uid) {
      return 0;
    }
    return questCompanies.value.find((c) => c.uid === uid)?.applicantCount ?? 0;
  });

  async function loadApplicants() {
    if (!selectedCompanyUid.value) {
      applicants.value = [];
      return;
    }
    const res = await questApplicantsQuery();
    applicants.value = (res?.data?.questApplicants ?? []) as QuestApplicant[];
  }

  void loadQuestCompanies();

  watch(selectedCompanyUid, () => {
    void loadApplicants();
  });
</script>

<style lang="scss" module>
  .container {

    .filter {
      margin: 1.5rem 0;
    }

    .prompt {
      margin-top: 1rem;
      color: #666;
      font-style: italic;
    }

    .count {
      margin: 0 0 1rem;
      font-size: 1.05rem;
    }
  }
</style>
