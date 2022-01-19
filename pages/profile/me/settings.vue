<template>
  <app-user-profile-container>
    Settings :)
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";

  export default defineComponent({
    name: "PageProfileSettings",

    components: {
      AppUserProfileContainer,
    },
  });
</script>
