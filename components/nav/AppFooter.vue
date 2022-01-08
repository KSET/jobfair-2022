<template>
  <footer
    :class="$style.container"
  >
    <div
      :class="$style.content"
    >
      <h1 v-if="showLogos" :class="$style.header">
        <translated-text trans-key="footer.organisers" />
      </h1>

      <div v-if="showLogos" :class="$style.logoRow" class="grid">
        <div
          v-for="logo in logos"
          :key="logo.src"

          :class="$style.logoCol"
          class="col-6 lg:col-3 center"
        >
          <app-img
            :alt="logo.name"
            :class="[$style.logo, ...logo.class ?? []]"
            :src="logo.src"
            aspect-ratio="1"
            contain
          />
        </div>
      </div>
      <div v-if="showLogos" class="grid">
        <p-divider :class="$style.spacer" />
      </div>

      <div :class="$style.bottomPart" class="grid">
        <div
          class="col-6 flex-order-3 lg:flex-order-1"
        >
          <img
            :class="$style.jobfairLogo"
            alt="Job Fair logo"
            src="~/assets/images/logo/jobfair-mono.svg"
          >
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.kset" /> &copy; {{ (new Date).getFullYear() }}
          </div>
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.allRightsReserved" />
          </div>
          <client-only>
            <div
              v-if="!showConsent"
              :class="$style.afterJobfairText"
            >
              <translated-text
                style="cursor: pointer;"
                trans-key="footer.legal.cookiesReset"
                @click.native.prevent="clearConsent"
              />
            </div>
          </client-only>
        </div>
        <div
          class="col-6 lg:col-2 flex-order-1 lg:flex-order-2"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.qna.header" />
            </strong>
          </div>
        </div>
        <div
          class="col-6 lg:col-2 flex-order-2 lg:flex-order-3"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.contact.header" />
            </strong>
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.text" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.email" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.location" />
          </div>
        </div>
        <div
          class="col-6 lg:col-2 flex-order-4 lg:flex-order-4"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.followUs" />
            </strong>
          </div>
          <div :class="$style.socialIconContainer">
            <p-button
              v-for="social in socialIcons"
              :key="social.icon"
              :class="$style.socialIcon"
              class="p-button-icon-only p-button-text"
            >
              <a
                :class="$style.socialIconLink"
                :href="social.href"
                rel="noopener noreferrer"
                target="_blank"
              >
                <app-img
                  :alt="social.name"
                  :src="social.icon"
                />
              </a>
            </p-button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    useCssModule,
  } from "vue";
  import Divider from "primevue/divider";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  import {
    useSettingsStore,
  } from "~/store/settings";
  import AppImg from "~/components/util/app-img.vue";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const SocialIconLogos = import.meta.globEager("../../assets/images/component/AppFooter/icons/socials/*.png");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const LogoImages = import.meta.globEager("../../assets/images/component/AppFooter/logo/*.png");

  export default defineComponent({
    components: {
      AppImg,
      PDivider: Divider,
    },

    props: {
      showLogos: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    setup() {
      const cookieConsentStore = useCookieConsentStore();

      const socialIcons =
        Object.fromEntries(
          Object
            .entries(SocialIconLogos)
            .map(([ k, v ]) => [ k.replace(/.*\/icon-(.*)\..*?$/, "$1"), v.default ])
          ,
        )
      ;

      const logos =
        Object.fromEntries(
          Object
            .entries(LogoImages)
            .map(([ k, v ]) => [ k.replace(/.*\/(.*)\..*?$/, "$1"), v.default ])
          ,
        )
      ;

      const settingsStore = useSettingsStore();

      const getSetting = computed(() => settingsStore.getSetting);

      const style = useCssModule();

      return {
        clearConsent: cookieConsentStore.clearConsent,
        showConsent: computed(() => cookieConsentStore.showConsent),
        socialIcons: [
          {
            name: "Instagram",
            href: getSetting.value("Instagram URL", "#"),
            icon: socialIcons.ig,
          },
          {
            name: "Facebook",
            href: getSetting.value("Facebook URL", "#"),
            icon: socialIcons.fb,
          },
          {
            name: "Youtube",
            href: getSetting.value("Youtube URL", "#"),
            icon: socialIcons.yt,
          },
          {
            name: "LinkedIn",
            href: getSetting.value("LinkedIn URL", "#"),
            icon: socialIcons.ln,
          },
        ],
        logos: [
          {
            name: "FER",
            src: logos.fer,
          },
          {
            name: "Centar Karijera",
            src: logos.ck,
          },
          {
            name: "KSET",
            src: logos.kset,
          },
          {
            name: "SSFER",
            src: logos.ssfer,
            class: [ style.ssferLogo ],
          },
        ],
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:math";
  @import "assets/styles/include/all";

  $breakpoint: md;

  .container {
    overflow: hidden;
    width: 100%;
    margin-top: auto;
    background-color: $fer-dark-blue;

    .header {
      font-size: 2.5rem;
      margin-bottom: 3.125rem;
      text-align: center;
      color: $fer-yellow;

      @include media($breakpoint) {
        font-size: 1.625rem;
      }
    }

    .logoRow {
      display: grid;
      align-items: center;
      justify-content: center;
      width: 60%;
      margin: 0 auto;
      padding: 0;
      transition-property: padding, width;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-column-gap: 3rem;
      grid-row-gap: 2.5rem;

      @include media($breakpoint) {
        width: 100%;
        padding: 0 .75rem;
        grid-template-columns: 1fr 1fr;
      }

      .logoCol {
        align-self: center;
        width: 100%;
        padding: 0;
        justify-self: center;

        .logo {
          height: 3rem;
          transition-property: opacity;

          &:hover {
            opacity: .8;
          }
        }

        .ssferLogo {
          height: 9rem;

          @include media($breakpoint) {
            height: 5rem;
          }
        }
      }
    }

    .spacer {

      &::before {
        border-color: rgb(255 255 255 / 42%) !important;
      }
    }

    .content {
      width: calc(100% - 2rem);
      max-width: $content-max-width;
      margin: 0 auto;
      padding: 2rem 0;
      transition-property: padding;
      color: $fer-white;
      will-change: padding;

      a {
        text-decoration: none;
        color: $fer-white;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .jobfairLogo {
      $height: 3em;
      $aspect-ratio: math.div(110, 40);

      width: $height * $aspect-ratio;
      height: $height;
      margin-bottom: 1em;
    }

    .afterJobfairText {
      font-size: 90%;
      opacity: .7;
    }

    .bottomPart {
      font-size: 87.5%;
      margin-top: 1.5rem;

      @include media($breakpoint) {
        margin-top: 0;
      }

      strong {
        display: block;
        margin-bottom: .5rem;
      }
    }

    .socialIconContainer {
      display: flex;

      .socialIcon {
        width: auto;
        height: 1.3125rem;
        margin-right: .8rem;
        padding: 0;
        transition-property: opacity;

        .socialIconLink {
          width: 100%;
          height: 100%;
        }

        &:hover {
          opacity: .8;
        }

        &:last-child {
          margin-right: initial;
        }
      }
    }
  }
</style>
