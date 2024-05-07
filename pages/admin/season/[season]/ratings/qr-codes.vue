<template>
  <AppMaxWidthContainer>
    <h1>QR Kodovi za ocjenjivanje</h1>
    <div class="mb-4">
      <NuxtLink
        :href="`/admin#season-${ season.uid }`"
      >
        &larr; Back
      </NuxtLink>
    </div>

    <div :class="$style.applications">
      <div v-for="application in applications" :key="application.forCompany!.uid" :class="$style.application">
        <h2>{{ application.forCompany!.brandName }} / {{ application.forCompany!.legalName }}</h2>

        <div :class="$style.applicationImgContainer">
          <div v-for="info in applicationToLinks(application)" :key="info.text">
            <h4>{{ info.text }}</h4>
            <a :href="`/company/${ application.forCompany!.uid }/rate?season=${ seasonUid }&type=${info.type}`">
              <UtilAppImg
                contain
                :alt="`${application.forCompany!.brandName} ${info.text}`"
                :src="`/api/i/qr/link?url=${encodeURIComponent(`https://jobfair.fer.unizg.hr/company/${ application.forCompany!.uid }/rate?season=${ seasonUid }&type=${info.type}`)}&color.dark=%23000&color.logo=%23fff&text=${encodeURIComponent(`${application.forCompany!.brandName}`)}`"
                :class="$style.applicationImg"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  </AppMaxWidthContainer>
</template>

<script lang="ts" setup>
  import {
    graphql,
  } from "~/graphql/client";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

  const seasonsStore = useSeasonsStore();
  const season = computed(() => seasonsStore.season!);
  const seasonUid = season.value.uid!;

  const title = computed(() => `Admin - ${ season.value.name } - Ocjenjivanje - QR kodovi`);
  useTitle(title, false);

  const pageData = await useQuery({
    query: graphql(/* GraphQL */ `
    query PageAdminSeasonRatingsQrCodesData($season: String!) {
      season(uid: $season) {
        name
        startsAt
        endsAt
        applications {
          forCompany {
            uid
            legalName
            brandName
          }
          approval {
            booth
            talkParticipants
            workshopParticipants
            panel
          }
        }
      }
    }
    `),
    variables: {
      season: seasonUid,
    },
  })().then((res) => res?.data);

  if (!pageData?.season) {
    throw createError({ statusCode: 500, statusMessage: "Season could not be found" });
  }

  type QSeason = NonNullable<(typeof pageData)["season"]>;
  type QApplication = QSeason["applications"][number];

  const { applications } = pageData.season;

  const applicationToLinks = (application: QApplication) => {
    const { approval } = application;
    if (!approval) {
      return [];
    }

    const links = [] as {
      text: string,
      type: string,
    }[];

    if (approval.booth) {
      links.push({
        text: "Booth",
        type: "booth",
      });

      return links;
    }

    if (approval.talkParticipants) {
      links.push({
        text: "Talk",
        type: "talk",
      });
    }

    if (approval.workshopParticipants) {
      links.push({
        text: "Workshop",
        type: "workshop",
      });
    }

    return links;
  };
</script>

<style module lang="scss">
  @use "sass:map";
  @use "sass:color";
  @import "assets/styles/include";

  .applications {
    display: flex;
    flex-flow: column;
    gap: 1em;
  }

  .application {
    padding: 1em;
    border: 1px solid #{$fer-off-gray};
    border-radius: 8px;
    box-shadow: #{map.get($shadows, "shadow-4")};

    .applicationImgContainer {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 4em;
      row-gap: 2em;
    }

    .applicationImg {
      aspect-ratio: 1;
    }
  }
</style>
