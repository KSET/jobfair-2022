<template>
  <div
    v-if="isLoggedIn"
    :class="$style.container"
  >
    <p-button
      :class="$style.dropdownButton"
      aria-controls="user-dropdown-panel"
      aria-haspopup="true"
      class="p-button-outlined"
      type="button"
      @click="onNameClick"
    >
      <span v-text="user.name" />
      <icon-chevron-down
        :class="{
          [$style.dropdownIcon]: true,
          [$style.dropdownIconFlipped]: isOverlayPanelOpen,
        }"
      />
    </p-button>
    <client-only>
      <p-overlay-panel
        id="user-dropdown-panel"
        ref="op$"
        @hide="isOverlayPanelOpen = false"
        @show="isOverlayPanelOpen = true"
      >
        <div>
          <small v-text="user.email" />
        </div>
        <v-button @click="logout">
          Logout
        </v-button>
      </p-overlay-panel>
    </client-only>
  </div>
  <nuxt-link
    v-else
    :to="joinNowRoute"
  >
    <p-button class="p-button-outlined">
      <translated-text trans-key="button.joinNow" />
    </p-button>
  </nuxt-link>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
    unref,
    watch,
  } from "vue";
  import OverlayPanel from "primevue/overlaypanel";
  import Button from "primevue/button";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";
  import {
    useUserStore,
  } from "~/store/user";
  import IconChevronDown from "~icons/ep/arrow-down";

  export default defineComponent({
    components: {
      TranslatedText,
      POverlayPanel: OverlayPanel,
      VButton: Button,
      IconChevronDown,
    },

    setup() {
      const joinNowRoute = useJoinNowRoute();
      const userStore = useUserStore();
      const op$ = ref(null as (null | OverlayPanel));
      const isOverlayPanelOpen = ref(false);
      const isLoggedIn = computed(() => userStore.isLoggedIn);

      watch(isLoggedIn, (value) => {
        if (!value) {
          isOverlayPanelOpen.value = false;
        }
      });

      return {
        onNameClick(event: Event) {
          unref(op$)?.toggle(event);
        },
        async logout() {
          await userStore.logout();
        },
        joinNowRoute,
        isLoggedIn,
        isOverlayPanelOpen,
        user: computed(() => userStore.user),
        op$,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    .dropdownButton {
      font-weight: 600;
      padding: .625rem 1.3125rem;
      color: $fer-white;
      border-color: $fer-yellow;

      .dropdownIcon {
        width: .875rem;
        margin-left: .625rem;
        transition-property: transform;

        &.dropdownIconFlipped {
          transform: rotate(180deg);
        }
      }
    }
  }
</style>
