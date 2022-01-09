<template>
  <app-max-width-container :class="$style.container">
    <h1 class="mb-5">
      <translated-text trans-key="about-meetup.header" />
    </h1>

    <div class="grid justify-content-center">
      <div class="col-7">
        <app-img
          :src="img.illustrations.hero"
          alt="Hero"
          aspect-ratio="1"
          contain
        />
      </div>
    </div>

    <div :class="$style.section">
      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.about.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.about.text" />
      </p>
    </div>

    <div :class="[ $style.section, $style.locationSection]" class="grid">
      <div class="col-12 md:col-10">
        <h2 :class="$style.locationHeader">
          <translated-text trans-key="about-meetup.location.header" />
        </h2>

        <h3 :class="$style.locationSubHeader">
          <translated-text trans-key="about-meetup.location.text" />
        </h3>

        <div class="grid mt-7 justify-content-center">
          <div class="col-12 md:col-6">
            <app-img
              :src="img.icons.kset"
              alt="KSET publika"
              aspect-ratio="1"
              class="mx-6"
              contain
            />

            <p :class="$style.locationName">
              <translated-text trans-key="about-meetup.location.kset" />
            </p>
          </div>
          <div class="col-12 md:col-6">
            <app-img
              :src="img.icons.fer"
              alt="FER"
              aspect-ratio="1"
              class="mx-6"
              contain
            />

            <p :class="$style.locationName">
              <translated-text trans-key="about-meetup.location.fer" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div :class="$style.section" class="mt-8">
      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.attractions.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.attractions.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :src="img.illustrations.about"
        alt="About"
        aspect-ratio="1.15"
        contain
      />
    </div>

    <p-divider :class="$style.divider" />

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.talks"
        alt="Talks"
        aspect-ratio="1"
        class="md:-ml-3"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.talks.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.talks.text" />
      </p>

      <h3 :class="$style.subHeader">
        <translated-text trans-key="about-meetup.intoMyDay.header" />
      </h3>
      <p>
        <translated-text trans-key="about-meetup.intoMyDay.text" />
      </p>

      <h3 :class="$style.subHeader">
        <translated-text trans-key="about-meetup.deepDive.header" />
      </h3>
      <p>
        <translated-text trans-key="about-meetup.deepDive.text" />
      </p>

      <h3 :class="$style.subHeader">
        <translated-text trans-key="about-meetup.newTech.header" />
      </h3>
      <p>
        <translated-text trans-key="about-meetup.newTech.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.workshops"
        alt="Workshops"
        aspect-ratio="1"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.workshops.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.workshops.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.panel"
        alt="Panel"
        aspect-ratio="1"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.panels.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.panels.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.hotTalk"
        alt="Hot Talk"
        aspect-ratio="1"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.hot-talk.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.hot-talk.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.networking"
        alt="Networking"
        aspect-ratio="1"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.networking.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.networking.text" />
      </p>
    </div>

    <div :class="$style.section">
      <app-img
        :class="$style.eventIcon"
        :src="img.eventIcons.party"
        alt="Loosen Up party"
        aspect-ratio="1"
        contain
      />

      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.party.header" />
      </h2>
      <p>
        <translated-text trans-key="about-meetup.party.text" />
      </p>
    </div>

    <div :class="$style.section">
      <div class="grid justify-content-center">
        <div class="col-12 md:col-9">
          <app-img
            :src="img.illustrations.qr"
            alt="QR Code"
            aspect-ratio="1.16"
            contain
          />
        </div>
      </div>
    </div>

    <div :class="$style.section">
      <h2 :class="$style.header">
        <translated-text trans-key="about-meetup.howToParticipate.header" />
      </h2>

      <h3 :class="$style.subHeader">
        <translated-text trans-key="about-meetup.cv.header" />
      </h3>
      <p>
        <translated-text trans-key="about-meetup.cv.text" />
      </p>

      <h3 :class="$style.subHeader">
        <translated-text trans-key="about-meetup.qr.header" />
      </h3>
      <p>
        <translated-text trans-key="about-meetup.qr.text" />
      </p>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import Divider from "primevue/divider";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppImg from "~/components/util/app-img.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const IllustrationImages = import.meta.globEager("../assets/images/page/about/illustrations/*.png");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const IllustrationIcons = import.meta.globEager("../assets/images/page/about/icons/*.png");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const EventIcons = import.meta.globEager("../assets/images/icon/event-icons/*.png");

  export default defineComponent({
    name: "PageAbout",

    components: {
      TranslatedText,
      AppImg,
      AppMaxWidthContainer,
      PDivider: Divider,
    },

    setup() {
      useTitle("about-meetup.header");

      return {
        img: {
          illustrations: Object.fromEntries(
            Object
              .entries(IllustrationImages)
              .map(([ k, v ]) => [ k.split("/").pop()?.replace(/\.[^.]*/, "") ?? "", v.default ])
            ,
          ),
          icons: Object.fromEntries(
            Object
              .entries(IllustrationIcons)
              .map(([ k, v ]) => [ k.split("/").pop()?.replace(/\.[^.]*/, "") ?? "", v.default ])
            ,
          ),
          eventIcons: Object.fromEntries(
            Object
              .entries(EventIcons)
              .map(([ k, v ]) => [ k.split("/").pop()?.replace(/\.[^.]*/, "") ?? "", v.default ])
            ,
          ),
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  $max-width: 700px;
  $padding: 3.125rem;

  .container {
    max-width: $max-width;
    padding: 0 #{$padding};

    @include media(md) {
      padding: 0 1rem;
    }

    .section {
      display: flex;
      flex-direction: column;
      margin-top: 4rem;

      .eventIcon {
        width: 100px;
        margin-left: -.25rem;

        @include media(md) {
          margin-bottom: -1.5rem;
          margin-left: auto;
        }
      }
    }

    .header {
      font-size: 1.625rem;
      margin: 0 0 1rem;
      color: $fer-dark-blue;
    }

    .eventIcon + .header {
      margin-top: .8125rem;
    }

    .header + :global(p) {
      margin-top: 0;
    }

    .subHeader {
      font-size: 1.125rem;
      opacity: .8;
      color: $fer-dark-blue;
    }

    :global(p) + .subHeader {
      margin-top: 2rem;
    }

    .subHeader + :global(p) {
      margin-top: 0;
    }

    .locationSection {
      align-items: center;
      justify-content: center;
      margin-right: -#{$padding};
      margin-left: -#{$padding};
      background-color: rgba($fer-off-gray, .5);

      @include media(md) {
        margin-right: 0;
        margin-left: 0;
      }

      .locationHeader {
        margin-bottom: 1rem;
        text-align: center;
        color: $fer-dark-blue;
      }

      .locationSubHeader {
        margin: 0;
        text-align: center;
        opacity: .7;
        color: $fer-black;
      }

      .locationName {
        font-size: 1.625rem;
        font-weight: bold;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        text-align: center;
        opacity: .7;
        color: $fer-black;
      }
    }

    .divider {

      &::before {
        border-top: 1px dashed #{rgba($fer-black, .5)};
      }
    }
  }
</style>
