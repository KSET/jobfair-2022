<template>
  <div
    v-if="isLoggedIn"
    :class="$style.container"
  >
    <p-button
      :aria-controls="panelId"
      :class="$style.dropdownButton"
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
        :id="panelId"
        ref="op$"
        :append-to="mountTo"
        :class="{
          [$style.overlayPanel]: true,
          [$style.overlayPanelTop]: top,
        }"
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

        <div v-if="isAdmin" :class="$style.overlayPanelAdminContainer">
          <small :class="$style.overlayPanelLabel">Admin</small>
          <label class="flex">
            <input-switch v-model="translationsEditable" />
            <span style="margin-left: auto;">
              Edit text
            </span>
          </label>
          <div>
            <ul :class="$style.overlayPanelItems">
              <li>
                <nuxt-link :to="{ name: 'admin' }">
                  <translated-text
                    trans-key="admin.home"
                  />
                </nuxt-link>
              </li>
            </ul>
          </div>
        </div>

        <div>
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
        </div>
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
  import InputSwitch from "primevue/inputswitch";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useJoinNowRoute from "~/composables/useJoinNowRoute";
  import {
    useUserStore,
  } from "~/store/user";
  import IconChevronDown from "~icons/ep/arrow-down";
  import ProfilePicture from "~/components/user/profile/profile-picture.vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    components: {
      ProfilePicture,
      TranslatedText,
      POverlayPanel: OverlayPanel,
      InputSwitch,
      IconChevronDown,
    },

    props: {
      mountTo: {
        required: true,
        type: String,
      },

      top: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    setup() {
      const joinNowRoute = useJoinNowRoute();
      const translationsStore = useTranslationsStore();
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
        translationsEditable: computed({
          get: () => translationsStore.isEditable,
          set: (value) => translationsStore.isEditable = value,
        }),
        panelId: `overlay-panel-${ Date.now().toString(36) }-${ Math.random().toString(36).substring(3) }`,
        joinNowRoute,
        isLoggedIn,
        isOverlayPanelOpen,
        user: computed(() => userStore.user),
        isAdmin: computed(() => userStore.isAdmin),
        op$,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:color";
  @use "sass:math";
  @import "assets/styles/include";

  .container {
    position: relative;

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
    $item-gap: .875rem;
    $arrow-size: 10px;

    top: 100% !important;
    left: 100% !important;
    transform: translateX(-100%);
    color: pick-visible-color($background, $fer-white, $fer-black);
    border: 1px solid #{$border-color};
    background: $background;
    box-shadow: #{map.get($shadows, "shadow-4")};

    &.overlayPanelTop {
      top: calc(-1 * #{$arrow-size}) !important;
      left: 0 !important;
      margin-top: 0;
      transform: translate(0, -100%);

      &::before,
      &::after {
        left: 1.25rem !important;
        border-top-color: $border-color !important;
      }
    }

    &::before {
      margin-left: calc(-1 * #{$arrow-size}) !important;
      border-width: $arrow-size !important;
    }

    &::after {
      margin-left: calc(-.8 * #{$arrow-size}) !important;
      border-width: calc(.8 * #{$arrow-size}) !important;
    }

    &::before,
    &::after {
      left: calc(100% - 1.25rem) !important;
      border-bottom-color: $border-color !important;
    }

    :global(.p-overlaypanel-content) {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 0;

      > * {
        position: relative;
        display: flex;
        flex-direction: column;
        padding: #{$padding-y} #{$padding-x};
        border-bottom: 1px solid #{color.adjust($border-color, $alpha: -.4)};

        .overlayPanelLabel {
          font-size: .875rem;
          position: relative;
          top: calc(-.5 * #{$padding-y});
          left: calc(-.5 * #{$padding-x});
          margin-bottom: calc(-1 * (#{$item-gap} / 2));
          text-align: left;
          opacity: .6;
        }
      }

      .overlayPanelAdminContainer {
        display: flex;
        flex-direction: column;
        text-align: right;
        gap: $item-gap;
      }

      > *:last-child {
        border-bottom: none;
      }
    }

    :global {

      .p-inputswitch {

        .p-inputswitch-slider {
          background: color.adjust($fer-white, $alpha: -.62);

          &:hover {
            background: color.adjust($fer-white, $alpha: -.5);
          }
        }

        &.p-inputswitch-checked {

          .p-inputswitch-slider {
            background: color.adjust($fer-yellow, $alpha: -.5);
          }
        }
      }
    }

    .overlayPanelHeaderContainer {
      display: flex;
      align-items: center;
      flex-direction: row;
      gap: .875rem;
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
