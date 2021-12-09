<template>
  <NuxtPage
    v-bind="$attrs"
  />

  <client-only>
    <p-toast />
  </client-only>

  <cookie-consent />
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

  export default defineComponent({
    components: {
      CookieConsent,
      PToast: Toast,
    },

    inheritAttrs: false,

    setup() {
      onMounted(() => {
        useCookieConsentStore().fetchConsent();
      });
    },
  });
</script>
