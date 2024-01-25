<template>
  <app-max-width-container :class="$style.container">
    <h1>
      {{ seasonName }} / <translated-text trans-key="press.header" />
    </h1>

    <div>
      <h3>
        <translated-text trans-key="press.for-media" />
      </h3>
      <ul>
        <li v-for="pressRelease in pressReleases" :key="pressRelease.uid">
          <div :class="$style.item">
            <time
              :datetime="pressRelease.published.toISOString()"
              :title="pressRelease.published.toLocaleDateString()"
              v-text="formatDate(pressRelease.published)"
            />
            <span v-text="pressRelease.title" />
            <nuxt-link :to="{ name: 'admin-season-season-press-releases-uid-edit', params: { uid: pressRelease.uid } }">
              Edit
            </nuxt-link>
          </div>
        </li>
        <li>
          <nuxt-link :to="{ name: 'admin-season-season-press-releases-new' }">
            New
          </nuxt-link>
        </li>
      </ul>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    computed,
    useTitle,
    useQuery,
  } from "#imports";
  import {
    type IPressReleasesQuery,
    type IPressReleasesQueryVariables,
    PressReleases,
  } from "~/graphql/schema";
  import {
    AppMaxWidthContainer,
    TranslatedText,
    NuxtLink,
  } from "#components";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "PageAdminSeasonPressReleases",

    components: {
      AppMaxWidthContainer,
      TranslatedText,
      NuxtLink,
    },

    async setup() {
      const translationStore = useTranslationsStore();
      const seasonsStore = useSeasonsStore();

      const title = computed(() => `Admin - ${ seasonsStore.season?.name ?? "" } - ${ translationStore.capitalizedTranslation("press.header") }`);
      useTitle(title, false);

      const pressReleases = await useQuery<IPressReleasesQuery, IPressReleasesQueryVariables>({
        query: PressReleases,
        variables: {
          season: seasonsStore.season!.uid!,
        },
      })().then((res) =>
        res
          ?.data
          ?.pressReleases
          .map((x) => ({
            ...x,
            published: new Date(x.published as string),
          }))
      ,
      );

      return {
        pressReleases,
        formatDate: (date: Date) => `${ date.getDate() }. ${ date.getMonth() + 1 }. ${ date.getFullYear() }.`,
        seasonName: computed(() => seasonsStore.season!.name),
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    .item {
      display: flex;
      gap: .5em;
    }
  }
</style>
