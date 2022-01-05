<template>
  <app-max-width-container>
    Schedule :)
  </app-max-width-container>
</template>

<script>
  import AppMaxWidthContainer from "../components/AppMaxWidthContainer";
  import useTitle from "../composables/useTitle";

  export default {
    name: "PageSchedule",

    components: {
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("schedule.header");
    },
  };
</script>
