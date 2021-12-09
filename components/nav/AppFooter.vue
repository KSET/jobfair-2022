<template>
  <footer
    :class="$style.container"
  >
    <div
      :class="$style.content"
    >
      <h1>
        <translated-text trans-key="footer.organisers" />
      </h1>

      <div class="grid" :class="$style.bottomPart">
        <div
          class="col-6 flex-order-3 md:flex-order-1"
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
          class="col-6 md:col-2 flex-order-1 md:flex-order-2"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.qna.header" />
            </strong>
          </div>
        </div>
        <div
          class="col-6 md:col-2 flex-order-2 md:flex-order-3"
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
          class="col-6 md:col-2 flex-order-4 md:flex-order-4"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.followUs" />
            </strong>
          </div>
          <div>
            socials
            <!--            <v-btn
                v-for="icon in socialIcons"
                :key="icon.src"

                :class="$style.socialIcon"
                :href="icon.href"
                icon
                rel="noopener noreferrer"
                small
                target="_blank"
            >
              <img
                  :alt="icon.name"
                  :src="icon.src"
              >
            </v-btn>-->
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
  } from "vue";
  import {
    useCookieConsentStore,
  } from "~/store/cookieConsent";

  export default defineComponent({
    setup() {
      const cookieConsentStore = useCookieConsentStore();

      return {
        clearConsent: cookieConsentStore.clearConsent,
        showConsent: computed(() => cookieConsentStore.showConsent),
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    width: 100%;
    margin-top: auto;
    background-color: $fer-dark-blue;
  }

  .content {
    max-width: $content-max-width;
    width: calc(100% - 2rem);
    margin: 0 auto;
    padding: 2rem 0;
    transition-timing-function: $transition-timing-function;
    transition-duration: .3s;
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

  .bottomPart {
    font-size: 87.5%;
    margin-top: 1.5em;

    strong {
      display: block;
      margin-bottom: .3em;
    }
  }
</style>
