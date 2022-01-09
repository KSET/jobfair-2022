<template>
  <header
    :class="{
      [$style.container]: true,
      [$style.withShadow]: !isAtTop
    }"
  >
    <div
      :class="$style.layoutTopbar"
    >
      <div
        :class="$style.layoutTopbarLeft"
      >
        <nuxt-link
          :class="$style.logoContainer"
          :to="{ name: 'index' }"
        >
          <img
            :class="$style.logoImage"
            alt="Job Fair logo"
            src="~/assets/images/logo/jobfair.svg"
          >
        </nuxt-link>
      </div>

      <div
        :class="$style.layoutTopbarRight"
      >
        <ul class="hidden md:flex">
          <li
            v-for="page in pages"
            :key="`top-${page.name}`"
          >
            <nuxt-link
              :to="page.to"
              @click="sidebarOpen = false"
            >
              <translated-text :trans-key="page.name" />
            </nuxt-link>
          </li>
          <li>
            <nuxt-link :class="$style.button" :to="{ name: 'about' }">
              <p-button class="p-button-outlined">
                Prijavi se
              </p-button>
            </nuxt-link>
          </li>
        </ul>
        <p-button
          :class="$style.sidebarBtn"
          class="md:hidden p-button-text"
          type="button"
          @click="sidebarOpen = true"
        >
          <img alt="Open menu" src="~/assets/images/component/AppHeader/menu.svg">
        </p-button>
        <client-only>
          <Sidebar
            v-model:visible="sidebarOpen"
            :class="$style.sidebar"
            position="full"
          >
            <ul :class="$style.sidebarNav">
              <li
                v-for="page in pages"
                :key="page.name"
              >
                <nuxt-link
                  :to="page.to"
                  @click="sidebarOpen = false"
                >
                  <translated-text :trans-key="page.name" />
                </nuxt-link>
              </li>
              <li>
                <nuxt-link :class="$style.button" :to="{ name: 'about' }">
                  <p-button class="p-button-outlined">
                    Prijavi se
                  </p-button>
                </nuxt-link>
              </li>
            </ul>
          </Sidebar>
        </client-only>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
  } from "vue";
  import {
    useWindowScroll,
  } from "@vueuse/core";
  import Sidebar from "primevue/sidebar";
  import {
    usePagesStore,
  } from "~/store/pages";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    components: {
      Sidebar,
      TranslatedText,
    },

    setup() {
      const { y } = useWindowScroll();

      const isAtTop = computed(() => 0 === y.value);

      const sidebarOpen = ref(false);

      const pagesStore = usePagesStore();
      const pages = computed(() => pagesStore.pages);

      return {
        isAtTop,
        sidebarOpen,
        pages,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include/all";

  $item-spacing: 1.5rem;

  .container {
    font-size: .85rem;
    position: fixed;
    z-index: 9;
    top: 0;
    right: 0;
    left: 0;
    padding: 0 #{$item-spacing};
    transition-property: box-shadow;
    background: $fer-dark-blue;
    will-change: box-shadow;

    &.withShadow {
      box-shadow: #{map.get($shadows, "shadow-4")};
    }
  }

  .sidebarBtn {
    display: flex;
    justify-content: right;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
  }

  .sidebar {

    &:global(.p-sidebar) {
      color: $fer-white;
      background-color: $fer-dark-blue;

      :global(.p-sidebar-icon) {
        color: $fer-white;
      }

      :global(.p-sidebar-header) {
        height: $nav-height;
        padding: 0 #{$item-spacing};

        &::before {
          align-self: center;
          width: 100%;
          height: 62.5%;
          content: "";

          // noinspection CssUnknownTarget
          background-image: url("~/assets/images/logo/jobfair.svg");
          background-repeat: no-repeat;
          background-position: left center;
          background-size: contain;
        }
      }

      :global(.p-sidebar-content) {
        display: flex;
        align-items: center;
        flex: 1 0 auto;
        justify-content: left;
      }
    }

    .sidebarNav {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;

      > li {

        > a {
          font-size: 1.625rem;
          display: block;
          padding: .5em 0;
          color: $fer-white;

          &:global(.router-link-exact-active) {
            color: $fer-yellow;
          }

          > button {
            font-size: 1rem;
            margin-top: .5rem;
          }
        }
      }

      > li + li {
        margin-top: .5rem;
      }
    }
  }

  .layoutTopbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: $content-max-width;
    height: $nav-height;
    margin: 0 auto;

    .layoutTopbarLeft {
      display: flex;
      align-items: center;
      height: 100%;

      .logoContainer {
        display: flex;
        align-items: center;
        height: $nav-height;

        .logoImage {
          height: 62.5%;
        }
      }
    }

    .layoutTopbarRight {
      display: flex;
      align-items: center;
      height: 100%;

      > ul {
        display: flex;
        align-items: center;
        height: 100%;
        margin: 0;
        padding: 0;

        li {
          display: flex;
          align-items: center;
          height: 100%;

          a {
            font-weight: bold;
            line-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            transition: border-color .2s;
            transition-duration: .15s;
            transition-property: color;
            text-decoration: none;
            color: $fer-white;
            border-bottom: 4px solid transparent;
            will-change: color;

            &:global(.router-link-exact-active) {
              border-color: $fer-yellow;
            }

            &:hover {
              color: $fer-yellow;
            }

            &.button {
              border: none;
            }
          }
        }

        li + li {
          margin-left: $item-spacing;
        }
      }
    }
  }

  @include media(md) {

    .layout-topbar {
      padding: 0 1rem;

      .layout-topbar-left {

        > a {
          display: none;
        }
      }

      .layout-topbar-right {

        > ul {

          li:not(:last-child) {
            display: none !important;
          }

          li:last-child {
            position: fixed;
            right: 2rem;
            bottom: 2rem;
            height: auto;

            .scheme-button {
              font-size: 1.5rem;
              width: 3rem;
              height: 3rem;
              margin-left: 0;
            }
          }
        }
      }
    }

  }
</style>
