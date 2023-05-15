<template>
  <AppMaxWidthContainer>
    <h1>Analytics</h1>

    <div>
      <NuxtLink to="/admin">
        &larr; Natrag
      </NuxtLink>
    </div>

    <iframe
      plausible-embed
      :src="plausibleShareUrl"
      scrolling="no"
      frameborder="0"
      loading="lazy"
      style="width: 1px; min-width: 100%; height: 1600px;"
    />
  </AppMaxWidthContainer>
</template>

<script setup lang="ts">
  import {
    onMounted,
    useRuntimeConfig,
    createError,
  } from "#imports";
  const config = useRuntimeConfig();
  const sessionId = unref(useCookie("jobfair-session"));

  const info = await $fetch<{ data: { shareUrl?: string, }, } | null>(`${ config.public.API_BASE }/info/analytics/`, {
    credentials: "include",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId ?? "",
    },
  });
  const plausibleShareUrl = info?.data?.shareUrl;

  if (!plausibleShareUrl) {
    throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
  }

  const plausibleOrigin = new URL(plausibleShareUrl).origin;

  const embedAnalyticsScript = () => {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.src = `${ plausibleOrigin }/js/embed.host.js`;
    document.body.appendChild(script);
  };

  onMounted(() => {
    embedAnalyticsScript();
  });
</script>
