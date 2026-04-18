<template>
  <app-max-width-container>
    <h1>Export</h1>
    <h2>Export logoa</h2>

    <div class="mb-3">
      <p-button
        label="Preuzmi raster logoe"
        @click="downloadRaster"
      />
    </div>

    <div class="mb-3">
      <p-button
        label="Preuzmi vektor logoe"
        @click="downloadVector"
      />
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    useRoute,
    useRuntimeConfig,
  } from "#imports";

  export default defineComponent({
    name: "PageAdminSeasonApplicationsExport",

    setup() {
      const route = useRoute();
      const config = useRuntimeConfig();
      const seasonUid = route.params.season as string;
      const apiBase = config.public.API_BASE;

      return {
        downloadRaster() {
          window.open(`${ apiBase }/admin/logos/${ seasonUid }/export/raster.zip`);
        },
        downloadVector() {
          window.open(`${ apiBase }/admin/logos/${ seasonUid }/export/vector.zip`);
        },
      };
    },
  });
</script>
