<template>
  <app-max-width-container :class="$style.container">
    <!-- Left column -->
    <div :class="$style.companyInfo">
      <nuxt-link
        :class="$style.backButton"
        :to="{ name: 'schedule' }"
      >
        <strong>
          <i class="pi pi-chevron-left" />
          <span :class="$style.backButtonText"><translated-text trans-key="back" /></span>
        </strong>
      </nuxt-link>

      <div :class="$style.companyDescriptionContainer">
        <h4 :class="$style.companyDescriptionHeader">
          <translated-text trans-key="panel.about" />
        </h4>
        <p :class="$style.companyDescriptionText" v-text="panel.description" />
      </div>
    </div>

    <!-- Right column -->
    <div :class="$style.eventContainer">
      <h2 :class="$style.companyName" v-text="panel.name" />

      <!-- Event info + sign-up -->
      <div v-if="panel.event" :class="$style.itemHeader">
        <event-info-display :event="{ ...panel.event, start: new Date(panel.event.start), end: new Date(panel.event.end), type: EventType.Panel }" />
        <p-button
          v-if="loggedIn"
          :class="{
            [$style.signupButton]: !reservation,
            [$style.signoffButton]: reservation,
          }"
          :loading="signupLoading"
          @click="handleSignup"
        >
          <translated-text v-if="reservation" trans-key="company.event.user.sign-off" />
          <translated-text v-else trans-key="company.event.user.sign-up" />
        </p-button>
        <nuxt-link v-else :to="joinNowRoute">
          <p-button :class="$style.signupButton">
            <translated-text trans-key="company.event.user.sign-up" />
          </p-button>
        </nuxt-link>
      </div>

      <!-- Companies with panelists -->
      <template v-if="panel.companiesWithPanelists && panel.companiesWithPanelists.length > 0">
        <h4><translated-text trans-key="panel.panelists" /></h4>
        <div
          v-for="entry in panel.companiesWithPanelists"
          :key="entry.company.uid"
          :class="$style.companySection"
        >
          <nuxt-link :to="{ name: 'company-uid', params: { uid: entry.company.uid } }">
            <div :class="$style.companyChip">
              <app-img
                v-if="entry.company.rasterLogo"
                :alt="`${entry.company.brandName} logo`"
                :class="$style.companyChipImage"
                :lazy-src="entry.company.rasterLogo.thumbUrl"
                :src="entry.company.rasterLogo.fullUrl"
                contain
              />
              <div class="p-chip-text" v-text="entry.company.brandName" />
            </div>
          </nuxt-link>
          <div
            v-for="(presenter, idx) in entry.panelists"
            :key="idx"
            :class="$style.presenter"
          >
            <h5 :class="$style.presenterName" v-text="`${presenter.firstName} ${presenter.lastName}`" />
            <app-img
              v-if="presenter.photo"
              :alt="`${presenter.firstName} ${presenter.lastName}`"
              :class="$style.presenterPhoto"
              :lazy-src="presenter.photo.thumbUrl"
              :src="presenter.photo.fullUrl"
              cover
            />
            <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio')" />
          </div>
        </div>
      </template>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import type {
    PropType,
  } from "vue";
  import {
    computed,
    defineComponent,
    ref,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppImg from "~/components/util/app-img.vue";
  import EventInfoDisplay from "~/components/page/schedule/event-info-display.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    type IPageCalendarEventPanelDataQuery,
  } from "~/graphql/schema";
  import {
    useCalendarStore,
  } from "~/store/calendar";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useJoinNowRoute,
  } from "~/composables/useJoinNowRoute";
  import {
    EventType,
  } from "~/helpers/event-status";

  type PanelData = NonNullable<NonNullable<IPageCalendarEventPanelDataQuery["calendarItem"]>["forPanel"]>;

  export default defineComponent({
    name: "PanelEventView",

    components: {
      AppMaxWidthContainer,
      AppImg,
      EventInfoDisplay,
      TranslatedText,
      PButton: Button,
    },

    props: {
      panel: {
        type: Object as PropType<PanelData>,
        required: true,
      },
    },

    setup(props) {
      const calendarStore = useCalendarStore();
      const userStore = useUserStore();
      const translationsStore = useTranslationsStore();

      const reservation = ref(props.panel.reservation);
      const signupLoading = ref(false);

      const handleSignup = async () => {
        if (!userStore.isLoggedIn) {
          return;
        }

        signupLoading.value = true;
        const resp = await calendarStore.toggleEventReservation({
          uid: props.panel.uid,
          type: EventType.Panel,
          reservation: reservation.value,
        });
        signupLoading.value = false;

        if (resp?.entity) {
          reservation.value = resp.entity.status;
        }
      };

      return {
        reservation,
        signupLoading,
        loggedIn: computed(() => userStore.isLoggedIn),
        translateFor: computed(() => translationsStore.translateFor),
        joinNowRoute: useJoinNowRoute(),
        EventType,
        handleSignup,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  $gap-size: 3.125rem;

  .container {
    display: grid;
    width: 100%;
    padding-top: 4rem;
    grid-template-columns: minmax(0, 3fr) minmax(0, 5fr);
    gap: $gap-size;

    h2,
    h4 {
      color: $fer-dark-blue;
    }

    @include media(md) {
      $gap-size: 1.5rem;

      padding-top: $gap-size;
      grid-template-columns: minmax(0, 1fr);
      gap: $gap-size;

      .companyDescriptionContainer {
        display: none;
      }

      .companyInfo {
        gap: $gap-size;
      }
    }
  }

  .companyInfo {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex-grow: 0;
    gap: $gap-size;

    > * {
      flex: inherit;
    }
  }

  .backButton {
    display: flex;
    align-items: center;
  }

  .backButtonText {
    margin-left: .5rem;
  }

  .companyDescriptionContainer {
    display: block;
  }

  .companyDescriptionHeader {
    font-size: 1rem;
    margin: 0;
    text-transform: uppercase;
  }

  .companyDescriptionText {
    margin: 0;
    margin-top: .5rem;
    white-space: break-spaces;
  }

  .eventContainer {
    display: block;
  }

  .companyName {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    color: $fer-dark-blue;
  }

  .itemHeader {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .signupButton,
  .signoffButton {
    font-size: 1.2rem;
    font-weight: bold;
    padding: .85rem 1rem;
    transition: background-color .2s ease;
  }

  .signoffButton {
    background-color: $fer-dark-blue;
  }

  .signupButton {
    background-color: $fer-yellow;

    span {
      color: $fer-white;
    }
  }

  $presenter-photo-size: 4rem;
  $presenter-bio-offset: .75rem;

  .presenter {
    display: inline-block;
    margin-top: .5rem;
    padding-top: .5rem;

    & + .presenter {
      border-top: 1px solid #{$fer-gray};
    }
  }

  .presenterName {
    font-size: 1em;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: calc(#{$presenter-photo-size} + #{$presenter-bio-offset} / 2);
  }

  .presenterPhoto {
    float: left;
    width: $presenter-photo-size;
    height: $presenter-photo-size;
    margin-right: $presenter-bio-offset;
    border-radius: 100%;
    clip-path: circle();
    shape-outside: circle();
  }

  .presenterDescription {
    margin-top: .5rem;
    white-space: break-spaces;
  }

  .companySection {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #{$fer-gray};

    &:first-child {
      border-top: none;
      margin-top: 1rem;
      padding-top: 0;
    }
  }

  .companyChip {
    display: inline-flex;
    align-items: center;
    padding: 0 .75rem;
    transition-property: background-color;
    color: $fer-black;
    border-radius: 16px;
    background-color: transparent;

    &:hover {
      background-color: #{color.adjust($fer-dark-blue, $alpha: -.9)};
    }
  }

  .companyChipImage {
    width: 2.5rem;
    height: 2.5rem;
    margin-right: .5rem;
  }
</style>
