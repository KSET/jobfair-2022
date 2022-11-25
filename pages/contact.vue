<template>
  <app-max-width-container :class="$style.container">
    <h1 :class="$style.header">
      <translated-text trans-key="contact.header" />
    </h1>

    <div class="grid">
      <div class="col-12 md:col-5 md:col-offset-1 mb-8 md:mb-0">
        <app-img
          :src="ImageContact"
          alt="Contact"
          aspect-ratio="0.95"
          contain
        />
      </div>

      <div class="col-10 md:col-5 col-offset-1 flex">
        <div :class="$style.linkEntriesContainer">
          <h2 :class="$style.subHeader">
            <translated-text trans-key="contact.jobFair" />
          </h2>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/mail.png']"
              alt="Email"
              aspect-ratio="1"
              contain
            />
            <a
              :class="$style.link"
              :href="`mailto:${unref(trans.email)}`"
            >
              <translated-text
                v-model="trans.email"
                trans-key="contact.jobFair.email"
              />
            </a>
          </div>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/location.png']"
              alt="Location"
              aspect-ratio="1.45"
              contain
            />
            <a
              :class="$style.link"
              :href="`https://www.google.com/maps/search/${encodeURIComponent(trans.address.replace('<br>', ' '))}`"
              rel="noopener noreferrer"
              target="_blank"
            >
              <translated-text
                v-model="trans.address"
                trans-key="contact.jobFair.location"
              />
            </a>
          </div>

          <h2 :class="$style.subHeader">
            <translated-text trans-key="contact.social.headers" />
          </h2>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/insta.png']"
              alt="Instagram"
              aspect-ratio="1"
              contain
            />
            <a
              :class="$style.link"
              :href="getSetting('Instagram URL', '#')"
              rel="noopener noreferrer"
              target="_blank"
            >
              <translated-text trans-key="contact.social.instagram" />
            </a>
          </div>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/fb.png']"
              alt="Facebook"
              aspect-ratio="1"
              contain
            />
            <a
              :class="$style.link"
              :href="getSetting('Facebook URL', '#')"
              rel="noopener noreferrer"
              target="_blank"
            >
              <translated-text trans-key="contact.social.facebook" />
            </a>
          </div>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/yt.png']"
              alt="YouTube"
              aspect-ratio="1"
              contain
            />
            <a
              :class="$style.link"
              :href="getSetting('Youtube URL', '#')"
              rel="noopener noreferrer"
              target="_blank"
            >
              <translated-text trans-key="contact.social.youtube" />
            </a>
          </div>

          <div :class="$style.linkContainer">
            <app-img
              :class="$style.icon"
              :src="Icons['@/assets/images/page/contact/icons/linkedIn.png']"
              alt="LinkedIn"
              aspect-ratio="1"
              contain
            />
            <a
              :class="$style.link"
              :href="getSetting('LinkedIn URL', '#')"
              rel="noopener noreferrer"
              target="_blank"
            >
              <translated-text trans-key="contact.social.linkedIn" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    unref,
  } from "vue";
  import {
    map,
    path,
    pipe,
    replace,
  } from "rambda";
  import {
    mapKeys,
  } from "rambdax";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppImg from "~/components/util/app-img.vue";
  import ImageContact from "~/assets/images/page/contact/contact.png";
  import {
    useSettingsStore,
  } from "~/store/settings";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageContact",

    components: {
      AppImg,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("contact.header");

      const Icons =
        pipe(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: Some advanced spooky stuff went wrong here type-wise
          mapKeys(replace(/^(\.\.\/)*/, "@/")),
          map(path("default")),
        )(
          import.meta.glob("../assets/images/page/contact/icons/*.png", { eager: true }) as unknown as Record<string, { default: string, }>,
        )
      ;

      const settingsStore = useSettingsStore();
      return {
        Icons,
        ImageContact,
        trans: reactive({
          email: "",
          address: "",
        }),
        unref,
        getSetting: computed(() => settingsStore.getSetting),
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

    .header {
      font-size: 2.5rem;
      color: $fer-dark-blue;
    }

    .subHeader {
      font-size: 1.625rem;
      margin-bottom: 1rem;
      color: $fer-dark-blue;
    }

    .linkEntriesContainer {
      align-self: center;

      > h2:first-child {
        margin-top: 0;
      }
    }

    .linkContainer {
      font-size: 1.25rem;
      display: grid;
      align-items: center;
      grid-template-columns: auto 1fr;

      & + .linkContainer {
        margin-top: .69em;
      }

      & + .subHeader {
        margin-top: 3.5rem;

        @include media(md) {
          margin-top: 4.375rem;
        }
      }

      .icon {
        width: 1.25rem;
        height: 1.25rem;
        margin-right: .69rem;
      }

      .link {
        font-size: 1rem;
        text-decoration: none;
        color: $fer-black;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
