<template>
  <AppMaxWidthContainer>
    <h1>Ocjene firmi na {{ season.name }}</h1>

    <div class="mb-4">
      <NuxtLink
        :href="`/admin#season-${ season.uid }`"
      >
        &larr; Back
      </NuxtLink>
    </div>

    <div class="flex flex-column gap-2">
      <Card v-for="company in companies" :key="company.uid">
        <template #title>
          {{ company.brandName }}
        </template>

        <template #content>
          <ul>
            <li v-for="rating in company.ratings" :key="rating.component">
              <strong v-text="rating.component" />: {{ rating.averageRating.toFixed(4) }}
            </li>
          </ul>

          <Panel toggleable header="Komentari">
            <Inplace>
              <template #display>
                Učitaj komentare
              </template>
              <template #content>
                <ScrollPanel style="width: 100%; height: 16rem;">
                  <LazyPageAdminSeasonSeasonRatingsCompaniesCompanyComments
                    :company-uid="company.uid"
                    :season-uid="season.uid!"
                  />
                </ScrollPanel>
              </template>
            </Inplace>
          </Panel>
        </template>
      </Card>
    </div>

    <div class="mt-4">
      <NuxtLink
        :href="`/admin#season-${ season.uid }`"
      >
        &larr; Back
      </NuxtLink>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import Card from "primevue/card";
  import Panel from "primevue/panel";
  import ScrollPanel from "primevue/scrollpanel";
  import Inplace from "primevue/inplace";
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  const seasonsStore = useSeasonsStore();

  const season = computed(() => seasonsStore.season!);

  useTitle(`Ocjene firmi | ${ season.value.name } | Admin`, false);

  const pageData = await useQuery({
    query: graphql(/* GraphQL */ `
    query PageAdminSeasonRatingsCompanies_Data($season: String!) {
      season(uid: $season) {
        applications {
          forCompany {
            uid
            legalName
            brandName
            ratings {
              averageRating
              component
            }
          }
        }
      }
    }
    `),
    variables: {
      season: season.value.uid!,
    },
  })().then((res) => res?.data);

  const companies = computed(() => {
    return pageData?.season?.applications?.map((x) => x.forCompany).filter(Boolean) ?? [];
  });
</script>

<style lang="scss" module>

</style>
