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
        :class="$style.overlayPanel"
        @hide="isOverlayPanelOpen = false"
        @show="isOverlayPanelOpen = true"
      >
        <div :class="$style.overlayPanelHeaderContainer">
          <profile-picture style="width: 3rem;" />

          <div :class="$style.overlayPanelHeader">
            <span
              :class="$style.overlayPanelTitle"
              v-text="user.name"
            />
            <span
              :class="$style.overlayPanelSubtitle"
              v-text="user.email"
            />
          </div>
        </div>

        <hr>

        <ul :class="$style.overlayPanelItems">
          <li>
            <nuxt-link :to="{ name: 'profile-me' }">
              <translated-text
                trans-key="profile.my-profile"
              />
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :to="{ name: 'profile-me-settings' }">
              <translated-text
                trans-key="profile.settings"
              />
            </nuxt-link>
          </li>
          <li>
            <translated-text
              trans-key="auth.logout"
              @click="logout"
            />
          </li>
        </ul>
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
  import TranslatedText from "~/components/TranslatedText.vue";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";
  import {
    useUserStore,
  } from "~/store/user";
  import IconChevronDown from "~icons/ep/arrow-down";
  import ProfilePicture from "~/components/user/profile/profile-picture.vue";

  export default defineComponent({
    components: {
      ProfilePicture,
      TranslatedText,
      POverlayPanel: OverlayPanel,
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
          window.location.reload();
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
  @use "sass:map";
  @use "sass:color";
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

  .overlayPanel {
    $background: $fer-dark-blue;
    $border-color: $fer-white;
    $padding-x: 1.25rem;
    $padding-y: .875rem;
    $gap: $padding-y;

    color: pick-visible-color($background, $fer-white, $fer-black);
    border: 1px solid #{$border-color};
    background: $background;
    box-shadow: #{map.get($shadows, "shadow-4")};

    &::before,
    &::after {
      // content: none;
      border-bottom-color: $border-color;
    }

    :global(.p-overlaypanel-content) {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: #{$padding-y} #{$padding-x};
      gap: $gap;
    }

    .overlayPanelHeaderContainer {
      display: flex;
      align-items: center;
      gap: $gap;
    }

    .overlayPanelHeader {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .overlayPanelTitle,
      .overlayPanelSubtitle {
        line-height: 1.2;
      }

      .overlayPanelSubtitle {
        font-size: .875rem;
        opacity: .6;
      }
    }

    hr {
      width: calc(100% + 2 * #{$padding-x});
      margin: 0 -#{$padding-x};
      opacity: .3;
    }

    ul.overlayPanelItems {
      margin: 0;
      padding: 0;
      list-style: none;

      li + li {
        margin-top: .75rem;
      }

      > li {
        text-align: right;

        > * {
          font-weight: 600;
          line-height: 1.2rem;
          cursor: pointer;
          transition-property: color;
          color: $fer-white;

          &:hover {
            transition-duration: 0s;
            color: $fer-yellow;
          }
        }
      }
    }
  }
</style>
