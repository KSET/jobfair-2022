<template>
  <app-user-profile-container>
    Profile :)
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";

  export default defineComponent({
    name: "PageProfileHome",

    components: {
      AppUserProfileContainer,
    },
  });
</script>
