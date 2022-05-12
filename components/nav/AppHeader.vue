<template>
  <header
    :class="{
      [$style.container]: true,
      [$style.withShadow]: !isAtTop
    }"
    role="navigation"
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
            src="~/assets/images/logo/jobfair.png"
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
            >
              <translated-text :trans-key="page.name" />
            </nuxt-link>
          </li>
          <li>
            <div
              id="header-nav-mount-point"
              class="relative"
            >
              <nav-user-module
                :class="$style.button"
                mount-to="#header-nav-mount-point"
              />
            </div>
          </li>
          <li class="ml-3">
            <ul :class="$style.languageSwitcher">
              <li
                v-for="(code, lang) in languages"
                :key="code"
                :class="{
                  [$style.languageSelected]: code === currentLanguage,
                }"
                @click="currentLanguage = code"
                v-text="lang"
              />
            </ul>
          </li>
        </ul>
        <p-button
          :class="$style.sidebarBtn"
          class="md:hidden p-button-text"
          type="button"
          @click="sidebarOpen = true"
        >
          <icon-menu-open />
        </p-button>
        <client-only>
          <Sidebar
            v-model:visible="sidebarOpen"
            :class="$style.sidebar"
            position="full"
          >
            <ul :class="$style.sidebarNav">
              <li :class="$style.languageSwitcherSidebarContainer">
                <ul :class="[$style.languageSwitcher, $style.languageSwitcherSidebar]">
                  <li
                    v-for="(code, lang) in languages"
                    :key="code"
                    :class="{
                      [$style.languageSelected]: code === currentLanguage,
                    }"
                    @click="currentLanguage = code"
                    v-text="lang"
                  />
                </ul>
              </li>
              <li
                v-for="page in sidebarPages"
                :key="page.name"
              >
                <nuxt-link
                  :to="page.to"
                >
                  <translated-text :trans-key="page.name" />
                </nuxt-link>
              </li>
              <li>
                <div
                  id="header-nav-sidebar-mount-point"
                  class="relative"
                >
                  <nav-user-module
                    :class="$style.button"
                    mount-to="#header-nav-sidebar-mount-point"
                    top
                  />
                </div>
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
    watch,
  } from "vue";
  import {
    useWindowScroll,
  } from "@vueuse/core";
  import Sidebar from "primevue/sidebar";
  import {
    useRoute,
  } from "vue-router";
  import {
    usePagesStore,
  } from "~/store/pages";
  import TranslatedText from "~/components/TranslatedText.vue";
  import IconMenuOpen from "~/assets/images/component/AppHeader/menu.svg?component";
  import NavUserModule from "~/components/nav/NavUserModule.vue";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";
  import {
    unref,
  } from "#imports";

  export default defineComponent({
    components: {
      NavUserModule,
      Sidebar,
      TranslatedText,
      IconMenuOpen,
    },

    setup() {
      const { y } = useWindowScroll();
      const pagesStore = usePagesStore();
      const translationsStore = useTranslationsStore();
      const route = useRoute();

      const isAtTop = computed(() => 0 === y.value);

      const sidebarOpen = ref(false);

      watch(
        route,
        () => {
          sidebarOpen.value = false;
        },
        {
          deep: true,
        },
      );

      const pages = computed(() => pagesStore.pages);
      const profilePages = computed(() => pagesStore.profilePages);
      const isProfilePage = ref(false);
      watch(
        () => route.path,
        () => {
          isProfilePage.value = /^\/profile\//gi.test(route.path);
        },
        {
          immediate: true,
        },
      );

      return {
        isAtTop,
        sidebarOpen,
        pages,
        sidebarPages: computed(() => unref(isProfilePage) ? unref(profilePages) : unref(pages)),
        languages: Language,
        currentLanguage: computed({
          get: () => translationsStore.currentLanguage,
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          set: (value) => translationsStore.setCurrentLanguage(value),
        }),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:color";
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
    color: $fer-white !important;
  }

  .sidebar {

    &:global(.p-sidebar) {
      color: $fer-white;
      background-color: $fer-dark-blue;

      :global(.p-sidebar-icon) {
        color: $fer-white;

        :global(.p-sidebar-close-icon) {
          width: 1.5rem;
          height: 1.5rem;
          margin-right: -.65rem;
          background-image: url("@/assets/images/component/AppHeader/close.svg?url");
          background-repeat: no-repeat;
          background-position: center center;
          background-size: contain;
          filter: invert(1);

          &::before {
            display: none;
          }
        }
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
          background-image: url("~/assets/images/logo/jobfair.png");
          background-repeat: no-repeat;
          background-position: left center;
          background-size: contain;
        }
      }

      :global(.p-sidebar-content) {
        position: relative;
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

        > li {
          display: flex;
          align-items: center;
          height: 100%;

          > a {
            font-weight: bold;
            line-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            transition-property: color, border-color;
            text-decoration: none;
            color: $fer-white;
            border-bottom: 4px solid transparent;
            will-change: color;

            &:global(.router-link-exact-active) {
              transition-duration: 0s;
              border-color: $fer-yellow;
            }

            &:hover {
              transition-duration: 0s;
              color: $fer-yellow;
            }

            &.button {
              border: none;
            }
          }
        }

        > li + li {
          margin-left: $item-spacing;
        }
      }
    }
  }

  .languageSwitcherSidebarContainer {
    position: absolute;
    top: 2rem;
    right: 1rem;
  }

  ul.languageSwitcher {
    margin: 0;
    padding: 0;
    list-style: none;
    color: $fer-white;

    &.languageSwitcherSidebar {
      font-size: 1.625rem;

      > li + li {
        margin-top: .5rem;
      }
    }

    > li + li {
      margin-top: .1rem;
    }

    li {
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: #{color.mix($fer-white, $fer-yellow, 50%)};
      }
    }

    .languageSelected {
      user-select: none;
      pointer-events: none;
      color: $fer-yellow !important;
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
