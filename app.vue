<template>
  <div>
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
  </div>
</template>

<script lang="ts">
  import {
    defineComponent,
    onMounted,
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  import FacebookShareImage from "~/assets/images/share/facebook.png";
  import AppProgressBar from "~/components/nav/AppProgressBar.vue";

  export default defineComponent({
    components: {
      AppProgressBar,
      CookieConsent,
      PToast: Toast,
    },

    inheritAttrs: false,

    setup() {
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
            viewport: "width=device-width, initial-scale=1, maximum-scale=3.0, minimum-scale=1, minimal-ui",
            "theme-color": "#00003F",
            "background-color": "#00003F",
            locale: "hr_HR",
            "locale:alternative": "en_US",
            siteName: "Job Fair",
          }),
        ],
      });
    },
  });
</script>
