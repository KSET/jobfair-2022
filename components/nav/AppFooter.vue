<template>
  <footer
    :class="$style.container"
    role="contentinfo"
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
            src="~/assets/images/logo/jobfair-mono.png"
          >
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.kset" /> &copy; {{ (new Date).getFullYear() }}
          </div>
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.allRightsReserved" />
          </div>
          <LazyClientOnly>
            <div
              v-if="!showConsent"
              :class="$style.afterJobfairText"
            >
              <translated-text
                style="cursor: pointer;"
                trans-key="footer.legal.cookiesReset"
                @click.prevent="clearConsent"
              />
            </div>
            <div
              :class="$style.afterJobfairText"
            >
              <translated-text
                style="cursor: pointer;"
                trans-key="footer.legal.privacyPolicy"
                @click.prevent="privacyPolicyOpen = true"
              />
            </div>
            <PDialog
              v-model:visible="privacyPolicyOpen"
              :class="$style.dialog"
              dismissable-mask
              maximizable
              modal
              position="bottom"
            >
              <template #header>
                <strong>
                  <translated-text trans-key="footer.legal.privacyPolicy.header" />
                </strong>
              </template>
              <translated-text trans-key="footer.legal.privacyPolicy.text" />
            </PDialog>
          </LazyClientOnly>
        </div>
        <div
          class="col-6 lg:col-2 flex-order-1 lg:flex-order-2"
        >
          <!-- <div>
            <strong>
              <translated-text trans-key="footer.qna.header" />
            </strong>
          </div> -->
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
          <strong>
            <translated-text trans-key="footer.followUs" />
          </strong>

          <div :class="$style.socialIconContainer">
            <div
              v-for="social in socialIcons"
              :key="social.icon"
              :class="$style.socialIcon"
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
                  contain
                />
              </a>
            </div>
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
  import Dialog from "primevue/dialog";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";
  import {
    useSettingsStore,
  } from "~/store/settings";
  import AppImg from "~/components/util/app-img.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    ref,
  } from "#imports";

  export default defineComponent({
    components: {
      TranslatedText,
      AppImg,
      PDivider: Divider,
      PDialog: Dialog,
    },

    // props: {
    //   showLogos: {
    //     required: false,
    //     type: Boolean,
    //     default: () => false,
    //   },
    // },

    setup() {
      const cookieConsentStore = useCookieConsentStore();

      const settingsStore = useSettingsStore();

      const getSetting = computed(() => settingsStore.getSetting);

      const privacyPolicyOpen = ref(false);

      const style = useCssModule();

      const globResult = import.meta.glob([
        "../../assets/images/component/AppFooter/icons/socials/*.png",
        "../../assets/images/component/AppFooter/logo/*.png",
      ], { eager: true }) as unknown as Record<string, { default: string, }>;

      const socialIcons =
        Object.fromEntries(
          Object
            .entries(globResult)
            .filter(([ key ]) => key.startsWith("../../assets/images/component/AppFooter/icons/socials/"))
            .map(([ key, value ]) => [
              key.replace(/.*\/icon-(.*)\..*?$/, "$1"),
              value.default,
            ])
          ,
        )
      ;

      const logos =
        Object.fromEntries(
          Object
            .entries(globResult)
            .filter(([ key ]) => key.startsWith("../../assets/images/component/AppFooter/logo/"))
            .map(([ key, value ]) => [
              key.replace(/.*\/(.*)\..*?$/, "$1"),
              value.default,
            ])
          ,
        )
      ;

      return {
        showLogos: false,
        clearConsent: () => cookieConsentStore.clearConsent(),
        showConsent: computed(() => cookieConsentStore.showConsent),
        privacyPolicyOpen,
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

  .dialog:not(:global(.p-dialog-maximized)) {
    max-width: 700px;
  }

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
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-column-gap: 3rem;
      grid-row-gap: 2.5rem;

      @include media($breakpoint) {
        width: 100%;
        padding: 0 .75rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
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
      height: 3em;
      margin-bottom: 1em;
      object-fit: contain;
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
      gap: .875rem;
      max-width: 12em;

      .socialIcon {
        flex: 1;
        width: auto;
        height: 1.3125rem;
        padding: 0;
        transition-property: opacity;

        .socialIconLink {
          width: 100%;
          height: 100%;
        }

        &:hover {
          opacity: .8;
        }
      }
    }
  }
</style>
