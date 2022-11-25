<template>
  <Html>
    <NuxtLayout>
      <PageNotFound :status="status" />
    </NuxtLayout>

    <LazyClientOnly>
      <PToast />
    </LazyClientOnly>

    <LazyClientOnly>
      <CookieConsent />
    </LazyClientOnly>
  </Html>
</template>

<script lang="ts" setup>
  import {
    onMounted,
  } from "vue";
  import PToast from "primevue/toast";
  import PageNotFound from "~/components/page-not-found.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    IInitialDataQuery,
    IInitialDataQueryVariables,
    InitialData,
  } from "~/graphql/schema";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    computed,
    unref,
    useError,
  } from "#imports";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  import CookieConsent from "~/components/nav/CookieConsent.vue";

  const translationsStore = useTranslationsStore();
  const userStore = useUserStore();
  const error = useError();

  translationsStore.setLanguageFromCookie();

  onMounted(() => {
    useCookieConsentStore().fetchConsent();
  });

  const status = computed((): number => {
    const err = unref(error);

    if (err instanceof Error) {
      return 500;
    }

    if (!err) {
      return 404;
    }

    return Number(err.statusCode);
  });

  const initialData = await useQuery<IInitialDataQuery, IInitialDataQueryVariables>({
    query: InitialData,
    variables: {
      language: translationsStore.currentLanguage,
    },
  })().then((resp) => resp?.data);


  console.error(unref(error)?.message);

  if (initialData) {
    userStore.user = initialData?.profile ?? null;
    translationsStore.setTranslations(initialData?.allTranslationsFor ?? []);
  }
</script>
