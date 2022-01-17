<template>
  <div>
    <Html lang="hr-HR" />

    <client-only>
      <app-progress-bar />
    </client-only>

    <NuxtPage
      v-bind="$attrs"
    />

    <client-only>
      <p-toast />
    </client-only>

    <client-only>
      <cookie-consent />
    </client-only>

    <client-only>
      <translation-float
        v-if="isLoggedIn"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    watch,
  } from "vue";
  import Toast from "primevue/toast";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  import CookieConsent from "~/components/nav/CookieConsent.vue";
  import {
    useMeta,
  } from "#meta";
  import {
    generateMetadata,
  } from "~/helpers/head";
  import FacebookShareImage from "~/assets/images/share/facebook.png";
  import AppProgressBar from "~/components/nav/AppProgressBar.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useNuxtApp,
  } from "#app";
  import TranslationFloat from "~/components/translation/translation-float.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    IInitialDataQuery,
    IInitialDataQueryVariables,
    InitialData,
  } from "~/graphql/schema";

  export default defineComponent({
    components: {
      TranslationFloat,
      AppProgressBar,
      CookieConsent,
      PToast: Toast,
    },

    inheritAttrs: false,

    async setup() {
      const userStore = useUserStore();
      const translationsStore = useTranslationsStore();
      const nuxt = useNuxtApp();

      onMounted(() => {
        useCookieConsentStore().fetchConsent();
      });

      useMeta({
        title: "Job Fair",
        charset: "utf-8",
        meta: [
          ...generateMetadata({
            title: "Job Fair",
            type: "website",
            image: FacebookShareImage,
            viewport: "width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1, minimal-ui",
            "theme-color": "#00003f",
            "background-color": "#00003f",
            locale: "hr_HR",
            "locale:alternative": "en_US",
            siteName: "Job Fair",
          }),
        ],
      });

      const user = computed(() => userStore.user);

      watch(user, () => {
        translationsStore.isEditable = false;
      });

      const data = {
        isLoggedIn: computed(() => userStore.isLoggedIn),
      };

      if (!nuxt.ssrContext) {
        return data;
      }

      const initialData = await useQuery<IInitialDataQuery, IInitialDataQueryVariables>({
        query: InitialData,
        variables: {
          language: translationsStore.currentLanguage,
        },
      })().catch(() => null);

      if (!initialData) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userStore.user = initialData.data?.profile ?? null;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      translationsStore.setTranslations(initialData.data?.allTranslationsFor ?? []);

      return data;
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
</style>
