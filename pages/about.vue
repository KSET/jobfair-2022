<template>
  <app-max-width-container :class="$style.container">
    <h1 class="mb-5">
      <translated-text trans-key="about.header" />
    </h1>

    <div class="grid justify-content-center">
      <div class="col-12 md:col-7">
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
        <translated-text trans-key="meetup.about.header" />
      </h2>
      <p>
        <translated-text trans-key="meetup.about.text" />
      </p>
    </div>

    <div :class="[ $style.section, $style.locationSection]" class="grid justify-content-center">
      <div class="col-12 md:col-10">
        <h2 class="text-center mb-3">
          <translated-text trans-key="meetup.location.header" />
        </h2>

        <h4 class="text-center m-0">
          <translated-text trans-key="meetup.location.text" />
        </h4>

        <div class="grid mt-7">
          <div class="col-8 md:col-6">
            <app-img
              :src="img.icons.kset"
              alt="KSET publika"
              aspect-ratio="1"
              class="mx-6"
              contain
            />

            <p :class="$style.locationName" class="mt-4 mb-3 text-center">
              <translated-text trans-key="meetup.location.kset" />
            </p>
          </div>
          <div class="col-8 md:col-6">
            <app-img
              :src="img.icons.fer"
              alt="FER"
              aspect-ratio="1"
              class="mx-6"
              contain
            />

            <p :class="$style.locationName" class="mt-4 mb-3 text-center">
              <translated-text trans-key="meetup.location.fer" />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div :class="$style.section" class="mt-8">
      <h2 :class="$style.header">
        <translated-text trans-key="meetup.attractions.header" />
      </h2>
      <p>
        <translated-text trans-key="meetup.attractions.text" />
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
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import Divider from "primevue/divider";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppImg from "~/components/util/app-img.vue";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const IllustrationImages = import.meta.globEager("../assets/images/page/about/illustrations/*.png");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const IllustrationIcons = import.meta.globEager("../assets/images/page/about/icons/*.png");

  export default defineComponent({
    name: "PageAbout",

    components: {
      AppImg,
      AppMaxWidthContainer,
      PDivider: Divider,
    },

    setup() {
      return {
        img: {
          illustrations: Object.fromEntries(
            Object
              .entries(IllustrationImages)
              .map(([ k, v ]) => [ k.split("/").pop()!.replace(/\.[^.]*/, ""), v.default ])
            ,
          ),
          icons: Object.fromEntries(
            Object
              .entries(IllustrationIcons)
              .map(([ k, v ]) => [ k.split("/").pop()!.replace(/\.[^.]*/, ""), v.default ])
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

    .section {
      margin-top: 4rem;
    }

    .header {
      margin: 0 0 1rem;
      color: $fer-dark-blue;
    }

    .locationSection {
      margin-right: -#{$padding};
      margin-left: -#{$padding};
      background-color: rgba($fer-off-gray, .5);

      .locationName {
        font-size: 1.625rem;
        font-weight: bold;
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
