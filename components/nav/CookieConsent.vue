<template>
  <transition name="cookie-consent">
    <div
      v-if="showConsent"
      :class="{
        [$style.container]: true,
      }"
    >
      <div
        :class="$style.body"
      >
        <app-img
          :class="$style.image"
          :src="img.iconCookie"
          alt="Cookie consent icon"
          aspect-ratio="1"
          contain
        />

        <div
          :class="$style.text"
        >
          <translated-text
            trans-key="cookieConsent.text"
          />
          <a
            :class="$style.moreInfo"
            href="#"
            @click.stop="dialog = true"
          >
            <translated-text
              trans-key="cookieConsent.moreInfo.link"
            />
          </a>
        </div>

        <p-button
          :class="$style.acceptButton"
          color="primary"
          @click="acceptConsent"
        >
          <translated-text
            trans-key="Prihvati"
          />
        </p-button>

        <p-button
          :class="$style.closeButton"
          class="p-button-rounded p-button-text p-button-secondary"
          @click="denyConsent"
        >
          <icon-close
            :class="$style.closeIcon"
          />
        </p-button>
      </div>

      <LazyClientOnly>
        <PDialog
          v-model:visible="dialog"
          :style="{ maxWidth: '700px' }"
          dismissable-mask
          :header="headerTranslation"
          maximizable
          modal
          position="bottom"
        >
          <translated-text
            trans-key="footer.legal.cookiePolicy.text"
          />
        </PDialog>
      </LazyClientOnly>
    </div>
  </transition>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
  } from "vue";
  import Dialog from "primevue/dialog";
  import AppImg from "~/components/util/app-img.vue";
  // @ts-ignore: Type declaration stuff
  import IconCookie from "~/assets/images/component/CookieConsent/icon-cookie.svg?url";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  // noinspection TypeScriptCheckImport
  import IconClose from "~icons/ep/close-bold";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useTranslationsStore,
  } from "~~/store/translations";

  export default defineComponent({
    components: {
      TranslatedText,
      AppImg,
      PDialog: Dialog,
      IconClose,
    },

    setup() {
      const cookieConsentStore = useCookieConsentStore();
      const translationStore = useTranslationsStore();
      const dialog = ref(false);

      return {
        acceptConsent: () => cookieConsentStore.acceptConsent(),
        denyConsent: () => cookieConsentStore.denyConsent(),
        showConsent: computed(() => cookieConsentStore.showConsent),
        headerTranslation: computed(() => translationStore.translation("footer.legal.cookiePolicy.header")),
        img: {
          iconCookie: IconCookie,
        },
        dialog,
      };
    },
  });
</script>

<style scoped>
  .cookie-consent-enter-active,
  .cookie-consent-leave-active {
    transition-property: opacity, transform;
  }

  .cookie-consent-enter-from,
  .cookie-consent-leave-to {
    transform: translateY(calc(100% + 1.5rem));
    opacity: 0;
  }
</style>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:math";
  @use "sass:color";
  @import "assets/styles/include/all";

  $breakpoint: lg;
  $gap: .875rem;
  $max-width: map.get($breakpoints, $breakpoint);

  .container {
    font-size: .875rem;
    position: fixed;
    z-index: 99;
    right: 0;
    bottom: 1.5rem;
    left: 0;
    max-width: $max-width;
    margin: 0 auto;
    padding: $gap;
    transition-property: bottom, max-width;
    background-color: color.adjust($fer-white, $alpha: -.1);
    will-change: bottom, max-width, transform, opacity;
    backdrop-filter: blur(10px);

    @include media($breakpoint) {
      bottom: -1px;
      max-width: 100%;
    }

    .body {
      display: grid;
      align-items: center;
      justify-content: space-evenly;
      grid-template-columns: 40px 4fr 7.8rem 3rem;
      grid-template-rows: auto;
      grid-gap: $gap;
      grid-template-areas: "img text accept close";

      @include media($breakpoint) {
        grid-template-columns: auto;
        grid-template-areas:
          "text   close"
          "accept accept";
        gap: 0;
      }
    }

    .image {
      grid-area: img;

      @include media($breakpoint) {
        display: none !important;
      }
    }

    .text {
      display: inline-block;
      order: 1;
      word-break: break-word;
      color: $fer-black;
      grid-area: text;
    }

    .moreInfo {
      font-weight: 600;
      color: $fer-dark-blue;
    }

    .acceptButton {
      order: 2;
      color: $fer-black !important;
      grid-area: accept;

      @include media($breakpoint) {
        order: 4;
        width: 12em;
        margin-top: $gap;
        margin-left: auto;
      }
    }

    .closeButton {
      display: block;
      order: 4;
      min-width: initial;
      padding-right: 0;
      padding-left: 0;
      grid-area: close;

      .closeIcon {
        $enlarge-by: .5rem;

        width: #{1rem + $enlarge-by};
        height: #{1rem + $enlarge-by};
        margin: #{-1 * math.div($enlarge-by, 2)};
      }

      @include media($breakpoint) {
        $dimension: 4rem;

        order: 2;
        width: calc(#{$dimension} - #{$gap});
        height: $dimension;
        margin-left: $gap;

        .closeIcon {
          $enlarge-by: 1.25rem;

          width: #{1rem + $enlarge-by};
          height: #{1rem + $enlarge-by};
          margin: #{-1 * math.div($enlarge-by, 2)};
        }
      }
    }
  }
</style>
