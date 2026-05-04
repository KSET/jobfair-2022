<template>
  <app-max-width-container>
    <div :class="$style.container">
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

        <div v-if="localizedDescription" :class="$style.companyDescriptionContainer">
          <h4 :class="$style.companyDescriptionHeader">
            <translated-text trans-key="event.about" />
          </h4>
          <p :class="$style.companyDescriptionText" v-text="localizedDescription" />
        </div>
      </div>

      <!-- Right column -->
      <div :class="$style.eventContainer">
        <h2 :class="$style.companyName" v-text="localizedName" />

        <!-- Event info -->
        <div v-if="otherContent.event" :class="$style.itemHeader">
          <event-info-display :event="{ ...otherContent.event, start: new Date(otherContent.event.start), end: new Date(otherContent.event.end), type: eventTypeAsIEventType }" />
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

        <!-- Participants -->
        <template v-if="otherContent.participants && otherContent.participants.length > 0">
          <h4><translated-text trans-key="event.participants" /></h4>
          <div
            v-for="(participant, idx) in otherContent.participants"
            :key="idx"
            :class="$style.presenter"
          >
            <h5 :class="$style.presenterName" v-text="`${ participant.firstName } ${ participant.lastName }`" />
            <img
              v-if="participant.photo"
              :alt="`${ participant.firstName } ${ participant.lastName }`"
              :class="$style.presenterPhoto"
              :src="participant.photo.fullUrl"
            >
            <p :class="$style.presenterDescription" v-text="localizeParticipantBio(participant)" />
          </div>
        </template>
      </div>
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
  import EventInfoDisplay from "~/components/page/schedule/event-info-display.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    type IEventType,
  } from "~/graphql/schema";
  import {
    useCalendarStore,
  } from "~/store/calendar";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    useJoinNowRoute,
  } from "~/composables/useJoinNowRoute";
  import {
    EventType,
    subtypeToEventType,
  } from "~/helpers/event-status";

  type OtherContentEvent = {
    start: string | Date,
    end: string | Date,
    location?: string | null,
  };

  type OtherContentPresenter = {
    firstName: string,
    lastName: string,
    bioEn: string,
    bioHr: string,
    photo?: { fullUrl: string, } | null,
  };

  type OtherContentData = {
    uid: string,
    nameHr: string,
    nameEn: string,
    descriptionHr: string,
    descriptionEn: string,
    subtype: string,
    reservation: number,
    event?: OtherContentEvent | null,
    participants?: OtherContentPresenter[] | null,
  };

  export default defineComponent({
    name: "OtherContentEventView",

    components: {
      AppMaxWidthContainer,
      EventInfoDisplay,
      TranslatedText,
      PButton: Button,
    },

    props: {
      otherContent: {
        type: Object as PropType<OtherContentData>,
        required: true,
      },
      eventType: {
        type: String,
        required: true,
      },
    },

    setup(props) {
      const translationsStore = useTranslationsStore();
      const calendarStore = useCalendarStore();
      const userStore = useUserStore();

      const reservation = ref(props.otherContent.reservation);
      const signupLoading = ref(false);

      const handleSignup = async () => {
        if (!userStore.isLoggedIn) {
          return;
        }

        signupLoading.value = true;
        const resp = await calendarStore.toggleEventReservation({
          uid: props.otherContent.uid,
          type: subtypeToEventType(props.otherContent.subtype),
          reservation: reservation.value,
        });
        signupLoading.value = false;

        if (resp?.entity) {
          reservation.value = resp.entity.status;
        }
      };

      return {
        localizedName: computed(() => translationsStore.translateFor(props.otherContent, "name")),
        localizedDescription: computed(() => translationsStore.translateFor(props.otherContent, "description")),
        eventTypeAsIEventType: computed(() => subtypeToEventType(props.eventType) as IEventType),
        localizeParticipantBio(participant: OtherContentPresenter) {
          return translationsStore.translateFor(participant, "bio");
        },
        reservation,
        signupLoading,
        loggedIn: computed(() => userStore.isLoggedIn),
        joinNowRoute: useJoinNowRoute(),
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

    img {
      width: 1.3125rem;
      height: 1.3125rem;
    }
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
    width: 100%;
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
    object-fit: cover;
  }

  .presenterDescription {
    margin-top: .5rem;
    white-space: break-spaces;
  }
</style>
