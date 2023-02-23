<template>
  <Html :lang="currentLanguage">
    <Head>
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta :content="currentLanguage" name="locale" />
      <Meta :content="currentLanguage" name="og:locale" property="og:locale" />
      <Meta
        v-for="language in otherLanguages"
        :key="language"
        :content="language"
        name="locale:alternative"
      />
      <Meta
        v-for="language in otherLanguages"
        :key="language"
        :content="language"
        name="og:locale:alternative"
        property="og:locale:alternative"
      />
    </Head>

    <NuxtLoadingIndicator
      :height="8"
      color="#ecb000"
    />

    <NuxtLayout>
      <nuxt-page />
    </NuxtLayout>

    <LazyClientOnly>
      <p-toast />
    </LazyClientOnly>

    <LazyClientOnly>
      <cookie-consent />
    </LazyClientOnly>

    <LazyClientOnly>
      <p-dialog
        :class="$style.translationsLoading"
        :visible="isTranslationsLoading"
        modal
      >
        <icon-globe
          :class="$style.translationsLoadingSpinner"
          class="pi pi-spin"
        />
      </p-dialog>
    </LazyClientOnly>
  </Html>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    unref,
    watch,
  } from "vue";
  import Toast from "primevue/toast";
  import Dialog from "primevue/dialog";
  import {
    useThrottle,
  } from "@vueuse/core";
  import {
    useRuntimeConfig,
  } from "#imports";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  import CookieConsent from "~/components/nav/CookieConsent.vue";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import FacebookShareImage from "~/assets/images/share/facebook.png";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useHead,
    useNuxtApp,
  } from "#app";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    IInitialDataQuery,
    IInitialDataQueryVariables,
    InitialData,
  } from "~/graphql/schema";
  // import IconSpinner from "~icons/fluent/spinner-ios-20-filled";
  // noinspection TypeScriptCheckImport
  import IconGlobe from "~icons/bi/globe";
  import {
    useNewsStore,
  } from "~/store/news";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    urlJoin,
  } from "~/helpers/url";

  export default defineComponent({
    components: {
      CookieConsent,
      PToast: Toast,
      PDialog: Dialog,
      IconGlobe,
    },

    async setup() {
      const userStore = useUserStore();
      const translationsStore = useTranslationsStore();
      const newsStore = useNewsStore();
      const seasonsStore = useSeasonsStore();
      const nuxt = useNuxtApp();
      const config = useRuntimeConfig();

      translationsStore.setLanguageFromCookie();

      const currentLanguage = computed(() => translationsStore.currentLanguage.replace(/_/gi, "-"));
      const otherLanguages = computed(() => translationsStore.otherLanguages.map((x) => x.replace(/_/gi, "-")));
      const isTranslationsLoading = useThrottle(computed(() => translationsStore.isLoading), 500);

      onMounted(() => {
        useCookieConsentStore().fetchConsent();
      });

      watch(currentLanguage, async () => {
        await newsStore.fetchNews();
      });

      nuxt.hook("page:finish", () => {
        window.scrollTo(0, 0);
      });

      useHead({
        title: "Job Fair",
        meta: [
          { charset: "utf-8" },
          ...generateMetadata({
            title: "Job Fair",
            type: "website",
            image: urlJoin(config.public.BASE_URL, FacebookShareImage),
            viewport: "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1, minimal-ui",
            "theme-color": "#00003f",
            "background-color": "#00003f",
            siteName: "Job Fair",
          }),
        ],
      });

      const user = computed(() => userStore.user);

      watch(user, () => {
        translationsStore.isEditable = false;
      });

      watch(
        user,
        () => {
          const u = unref(user);

          if (!u) {
            return;
          }

          (nuxt.$sentrySetUser as (user: Record<string, unknown>) => void)({
            id: u.uid,
            email: u.email,
          });
        },
        {
          immediate: true,
        },
      );

      if (nuxt.ssrContext) {
        const initialData = await useQuery<IInitialDataQuery, IInitialDataQueryVariables>({
          query: InitialData,
          variables: {
            language: translationsStore.currentLanguage,
          },
        })();

        if (initialData) {
          userStore.user = initialData.data?.profile ?? null;
          translationsStore.setTranslations(initialData.data?.allTranslationsFor ?? []);
          seasonsStore.setCurrentSeason(initialData.data?.currentSeason);
        }
      }

      return {
        isLoggedIn: computed(() => userStore.isLoggedIn),
        currentLanguage,
        otherLanguages,
        isTranslationsLoading,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  :global {

    * {
      transition-timing-function: $transition-timing-function;
      transition-duration: .25s;
      transition-property: none;
    }
  }

  .translationsLoading {
    box-shadow: none;

    :global(.p-dialog-header),
    :global(.p-dialog-footer) {
      display: none;
    }

    :global(.p-dialog-content) {
      $size: max(20vmin, 4rem);

      overflow: hidden;
      width: $size;
      height: $size;
      padding: 0;
      background: none;
    }

    .translationsLoadingSpinner {
      $shadow: 2px;

      width: 100%;
      height: 100%;
      padding: calc(2 * #{$shadow});
      filter: invert(1) drop-shadow(0 0 #{$shadow} black);
    }
  }
</style>
