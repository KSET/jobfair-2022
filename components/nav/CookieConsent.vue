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
          header="Pravila o kolačićima za Job Fair Meetup"
          maximizable
          modal
          position="bottom"
        >
          <p>
            This is the Cookie Policy for Job Fair, accessible from https://jobfair.fer.unizg.hr/
          </p>

          <div>
            <p>
              <strong>What Are Cookies</strong>
            </p>

            <p>
              As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what
              information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break'
              certain elements of the site's functionality.
            </p>
            <p>
              For more general information on cookies, please read <a href="https://www.privacypolicyonline.com/what-are-cookies/" target="_blank" rel="noopener noreferrer">"What Are Cookies"</a>.
            </p>
          </div>

          <div>
            <p>
              <strong>How We Use Cookies</strong>
            </p>

            <p>
              We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and
              features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
            </p>
          </div>

          <div>
            <p>
              <strong>Disabling Cookies</strong>
            </p>

            <p>
              You can prevent the setting of cookies by adjusting the settings on your browser (see your browser official help page for how to do this). Be aware that disabling cookies will affect the functionality
              of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not
              disable cookies.
            </p>
          </div>

          <div>
            <p>
              <strong>The Cookies We Set</strong>
            </p>

            <ul>
              <li>
                Account related cookies
                <br>
                If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some
                cases they may remain afterwards to remember your site preferences when logged out.
              </li>

              <li>
                Login related cookies
                <br>
                We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared
                when you log out to ensure that you can only access restricted features and areas when logged in.
              </li>

              <li>
                Forms related cookies
                <br>
                When you submit data through a form such as those found on registration pages, cookies may be set to remember your user details for future correspondence.
              </li>

              <li>
                Site preferences cookies
                <br>
                In order to provide you with a great experience on this site we provide the functionality to set your preferences for how this site runs when you use it. In order to remember your preferences we need
                to set cookies so that this information can be called whenever you interact with a page that is affected by your preferences.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <strong>Third Party Cookies</strong>
            </p>

            <p>
              In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
            </p>

            <ul>
              <li>
                This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your
                experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
                <br>
                For more information on Google Analytics cookies, see the official Google Analytics page.
              </li>

              <li>
                From time to time we test new features and make subtle changes to the way that the site is delivered. When we are still testing new features these cookies may be used to ensure that you receive a
                consistent experience whilst on the site whilst ensuring we understand which optimisations our users appreciate the most.
              </li>
            </ul>

            <p />
          </div>

          <div>
            <p>
              <strong>More Information</strong>
            </p>

            <p>
              Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it
              does interact with one of the features you use on our site.
            </p>
          </div>

          <div>
            <p>
              However if you are still looking for more information then you can contact us through our email: <a href="mailto:jobfair@fer.hr" target="_blank" rel="noopener noreferrer">jobfair@fer.hr</a>.
            </p>
          </div>
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  import IconCookie from "~/assets/images/component/CookieConsent/icon-cookie.svg?url";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  // noinspection TypeScriptCheckImport
  import IconClose from "~icons/ep/close-bold";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    components: {
      TranslatedText,
      AppImg,
      PDialog: Dialog,
      IconClose,
    },

    setup() {
      const cookieConsentStore = useCookieConsentStore();

      const dialog = ref(false);

      return {
        acceptConsent: () => cookieConsentStore.acceptConsent(),
        denyConsent: () => cookieConsentStore.denyConsent(),
        showConsent: computed(() => cookieConsentStore.showConsent),
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
