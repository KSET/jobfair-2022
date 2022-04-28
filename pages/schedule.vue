<template>
  <app-max-width-container :class="$style.container">
    <h1>
      <translated-text trans-key="schedule.header" />
    </h1>

    <div :class="$style.calendarContainer">
      <vue-calendar
        :click-to-navigate="false"
        :dblclick-to-navigate="false"
        :disable-views="['years', 'year', 'month', 'day']"
        :events="events"
        :hide-weekdays="[ 0, 1, 2, 5, 6 ]"
        :split-days="splitDays"
        :time-from="9.5 * 60"
        :time-step="15"
        :time-to="17.5 * 60"
        :watch-real-time="false"
        active-view="week"
        hide-title-bar
        hide-view-selector
        hide-weekends
        selected-date="2022-05-11"
      >
        <template #event="{ event, isLastDay }">
          <dropdown-menu
            :direction="isLastDay ? 'left' : 'right'"
            :with-arrow="false"
            arrow-border-color="var(--event-border-color)"
            arrow-color="var(--calendar-event-color-background)"
            hover
          >
            <template #trigger>
              <div
                :class="$style.eventContainer"
              >
                <strong
                  :class="$style.eventTitle"
                  :data-event="JSON.stringify(event)"
                  v-text="event.title"
                />
                <br>
                <span
                  :class="$style.eventTime"
                >
                  <time
                    :datetime="event.start.toISOString()"
                    v-text="formatEventTime(event.start)"
                  />
                  &ndash;
                  <time
                    :datetime="event.end.toISOString()"
                    v-text="formatEventTime(event.end)"
                  />
                </span>
                <div
                  v-if="event.location"
                  :class="$style.eventLocation"
                >
                  <i class="pi pi-map-marker" /> {{ event.location }}
                </div>
                <span
                  v-if="event.text"
                  :class="$style.eventText"
                  v-text="event.text"
                />
              </div>
            </template>
            <template v-if="false" #contents>
              <div
                :class="$style.eventDropdownContainer"
              >
                <div :class="$style.eventDropdown">
                  <div :class="$style.header">
                    <span v-text="event.title" />
                    <!--
                    <p-button
                      :class="{
                        [$style.star]: true,
                        [$style.starSelected]: event.selected,
                      }"
                      class="p-button-rounded p-button-text"
                      @click="event.selected = !event.selected"
                    >
                      <icon-star />
                    </p-button>
                    -->
                  </div>
                  <div :class="$style.contentContainer">
                    <div :class="$style.content">
                      <app-img
                        :class="$style.image"
                        :src="`https://placeimg.com/${ 80 + 1 }/${ 80 + 2 }/tech`"
                        alt="image"
                        aspect-ratio="2"
                        contain
                      />

                      <div
                        :class="$style.divider"
                      />

                      <div
                        :class="$style.text"
                      >
                        Ivan Horvat
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </dropdown-menu>
        </template>
      </vue-calendar>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import VueCalendar from "~/components/external/VueCalendar.vue";
  import useTitle from "~/composables/useTitle";
  import DropdownMenu from "~/components/util/dropdown-menu.vue";
  import IconStar from "~icons/grommet-icons/star";
  import AppImg from "~/components/util/app-img.vue";

  export default defineComponent({
    name: "PageSchedule",

    components: {
      AppImg,
      DropdownMenu,
      VueCalendar,
      TranslatedText,
      AppMaxWidthContainer,
      // eslint-disable-next-line vue/no-unused-components
      IconStar,
    },

    setup() {
      useTitle("schedule.header");

      const talks1 = [
        {
          start: "2022-05-11 10:00",
          end: "2022-05-11 10:30",
          title: "Ericsson",
          class: "talk",
        },
        {
          start: "2022-05-11 10:30",
          end: "2022-05-11 11:00",
          title: "Syntio",
          class: "talk",
        },

        {
          start: "2022-05-11 11:00",
          end: "2022-05-11 11:30",
          title: "Memgraph",
          class: "talk",
        },
        {
          start: "2022-05-11 11:30",
          end: "2022-05-11 12:00",
          title: "Končar",
          class: "talk",
        },

        {
          start: "2022-05-11 12:00",
          end: "2022-05-11 12:30",
          title: "Srce",
          class: "talk",
        },
        {
          start: "2022-05-11 12:30",
          end: "2022-05-11 13:00",
          title: "RealNetworks",
          class: "talk",
        },

        {
          start: "2022-05-11 14:00",
          end: "2022-05-11 14:30",
          title: "Ingemark",
          class: "talk",
        },
        {
          start: "2022-05-11 14:30",
          end: "2022-05-11 15:00",
          title: "A1",
          class: "talk",
        },

        {
          start: "2022-05-11 15:00",
          end: "2022-05-11 15:30",
          title: "Trikoder",
          class: "talk",
        },
        {
          start: "2022-05-11 15:30",
          end: "2022-05-11 16:00",
          title: "Microblink",
          class: "talk",
        },

        {
          start: "2022-05-11 16:00",
          end: "2022-05-11 16:30",
          title: "DECODE",
          class: "talk",
        },
        {
          start: "2022-05-11 16:30",
          end: "2022-05-11 17:00",
          title: "Infobip",
          class: "talk",
        },
      ];
      const talks2 = [
        {
          start: "2022-05-12 10:00",
          end: "2022-05-12 10:30",
          title: "mStart",
          class: "talk",
        },
        {
          start: "2022-05-12 10:30",
          end: "2022-05-12 11:00",
          title: "INETEC",
          class: "talk",
        },

        {
          start: "2022-05-12 11:00",
          end: "2022-05-12 11:30",
          title: "Gideon",
          class: "talk",
        },
        {
          start: "2022-05-12 11:30",
          end: "2022-05-12 12:00",
          title: "Arsfutura",
          class: "talk",
        },

        {
          start: "2022-05-12 12:00",
          end: "2022-05-12 12:30",
          title: "Poslovna inteligencija",
          class: "talk",
        },
        {
          start: "2022-05-12 12:30",
          end: "2022-05-12 13:00",
          title: "FIVE",
          class: "talk",
        },

        {
          start: "2022-05-12 14:00",
          end: "2022-05-12 14:30",
          title: "Xylon",
          class: "talk",
        },
        {
          start: "2022-05-12 14:30",
          end: "2022-05-12 15:00",
          title: "Span",
          class: "talk",
        },

        {
          start: "2022-05-12 15:00",
          end: "2022-05-12 15:30",
          title: "Deegloo",
          class: "talk",
        },
        {
          start: "2022-05-12 15:30",
          end: "2022-05-12 16:00",
          title: "minus5",
          class: "talk",
        },

        {
          start: "2022-05-12 16:00",
          end: "2022-05-12 16:30",
          title: "Photomath",
          class: "talk",
        },
        {
          start: "2022-05-12 16:30",
          end: "2022-05-12 17:00",
          title: "Rimac Automobili",
          class: "talk",
        },
      ];
      const talks = [
        ...talks1,
        ...talks2,
      ];

      const workshops1 = [
        {
          start: "2022-05-11 10:00",
          end: "2022-05-11 12:00",
          title: "dSpace",
          class: "workshop",
          location: "FER - A201",
        },
        {
          start: "2022-05-11 13:00",
          end: "2022-05-11 15:00",
          title: "CROZ",
          class: "workshop",
          location: "FER - A201",
        },
        {
          start: "2022-05-11 16:00",
          end: "2022-05-11 18:00",
          title: "SedamIT",
          class: "workshop",
          location: "FER - A201",
        },

        {
          start: "2022-05-11 10:00",
          end: "2022-05-11 12:00",
          title: "Agency04",
          class: "workshop",
          location: "FER - A301",
        },
        {
          start: "2022-05-11 13:00",
          end: "2022-05-11 15:00",
          title: "Alfatec",
          class: "workshop",
          location: "FER - A301",
        },
        {
          start: "2022-05-11 16:00",
          end: "2022-05-11 18:00",
          title: "Rimac Automobili",
          class: "workshop",
          location: "FER - A301",
        },

        {
          start: "2022-05-11 10:00",
          end: "2022-05-11 12:00",
          title: "TrueNorth",
          class: "workshop",
          location: "FER - Bijela",
        },
        {
          start: "2022-05-11 13:00",
          end: "2022-05-11 15:00",
          title: "Greyp",
          class: "workshop",
          location: "FER - Bijela",
        },
        {
          start: "2022-05-11 16:00",
          end: "2022-05-11 18:00",
          title: "CARNET",
          class: "workshop",
          location: "FER - Bijela",
        },
      ];
      const workshops2 = [
        {
          start: "2022-05-12 10:00",
          end: "2022-05-12 12:00",
          title: "Comsysto Reply",
          class: "workshop",
          location: "FER - Bijela",
        },
        {
          start: "2022-05-12 13:00",
          end: "2022-05-12 15:00",
          title: "Undabot",
          class: "workshop",
          location: "FER - Bijela",
        },
        {
          start: "2022-05-12 16:00",
          end: "2022-05-12 18:00",
          title: "Ericsson",
          class: "workshop",
          location: "FER - Bijela",
        },

        {
          start: "2022-05-12 10:00",
          end: "2022-05-12 12:00",
          title: "KONČAR",
          class: "workshop",
          location: "FER - SPOCK",
        },
        {
          start: "2022-05-12 13:00",
          end: "2022-05-12 15:00",
          title: "ByteLab",
          class: "workshop",
          location: "FER - SPOCK",
        },
        {
          start: "2022-05-12 16:00",
          end: "2022-05-12 18:00",
          title: "Arsfutura",
          class: "workshop",
          location: "FER - SPOCK",
        },

        {
          start: "2022-05-12 16:00",
          end: "2022-05-12 18:00",
          title: "Televend by Intis",
          class: "workshop",
          location: "FER - A211",
        },
      ];
      const workshops = [
        ...workshops1,
        ...workshops2,
      ];

      const splitDays = [
        { id: 1, label: "Talk", class: "talk-split" },
        { id: 2, label: "Workshop", class: "workshop-split" },
      ];

      const events = [
        ...talks.map((item) => ({ ...item, split: 1 })),
        ...workshops.map((item) => ({ ...item, split: 2 })),
      ].map((event) => Object.assign(event, { selected: 0.5 < Math.random() }));
      const eventTimeFormatter = new Intl.DateTimeFormat(
        undefined,
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      return {
        events,
        splitDays,

        formatEventTime: (date: Date): string => eventTimeFormatter.format(date),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:math";
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    $off-black: #8f9296;

    .calendarContainer {
      $cell-shrink-by: 10px;
      $cell-offset-left: 3px;
      $calendar-width: 95vw;

      position: relative;
      left: calc(.5 * #{$content-max-width} - #{$calendar-width});
      width: #{$calendar-width};
      height: calc(min(#{$content-max-width - math.div($content-padding, 2)}, 100vw) * .65);
      transform: translateX(50%);

      @include media(md) {
        display: none;
      }

      :global {
        --calendar-event-color-background: #{$fer-yellow};
        --calendar-event-color-text: #{pick-visible-color($fer-yellow, $fer-black, $fer-white)};
        --event-border-color: #{$off-black};

        @each $event, $color in $event-colors {
          .vuecal__event.#{$event} {
            --calendar-event-color-background: #{$color};
            --calendar-event-color-text: #{pick-visible-color($color, $fer-black, $fer-white)};
          }

          .vuecal__cell-split.#{$event}-split {
            background-color: #{color.adjust($color, $alpha: -.85)};

            .split-label {
              font-weight: bold;
              background-color: #{$color};
              border-bottom-left-radius: 4px;
              border-bottom-right-radius: 4px;
            }
          }

        }

        .vuecal__event {
          overflow: unset;
        }

        .vuecal__bg {
          overflow: unset;
        }

        .vuecal__body {
          overflow: visible scroll;
        }

        .vuecal__cell-content {
          width: calc(100% - #{$cell-shrink-by});
          margin-left: $cell-offset-left;
        }

        .vuecal__heading + .vuecal__heading {
          border-left: 1px solid rgb(0 0 0 / 10%);
        }
      }
    }

    .eventContainer {
      // Content
      $content-background-color: var(--calendar-event-color-background);
      $content-text-color: $fer-white; // var(--calendar-event-color-text);

      font-size: .875rem;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 5px;
      left: 0;
      overflow: hidden;
      padding: 4px;
      cursor: pointer;
      text-align: left;
      text-overflow: ellipsis;
      color: $content-text-color;
      border-radius: 4px;
      background-color: $content-background-color;

      &::before {
        position: absolute;
        right: .5rem;
        bottom: .5rem;
        width: 1.5rem;
        height: 100%;
        content: "";
        pointer-events: none;
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: contain;
        filter: drop-shadow(0 0 0 black) invert(1);
      }

      .eventTitle {
        color: $fer-white;
      }

      .eventTime {
        display: inline-block;
      }

      .eventTitle + .eventTime {
        margin-left: 1ch;
      }

      .eventLocation {
        font-size: .8em;
        margin: .5em 0;
      }

      .eventText {
        font-size: 1em;
      }
    }

    :global(.vuecal__cell-split) {

      .eventContainer {
        right: 4px;
      }
    }

    @each $name, $icon in $event-icons {
      :global(.#{$name}) {

        .eventContainer {

          &::before {
            background-image: $icon;
          }
        }
      }

    }

    .eventDropdownContainer {
      // Container
      $border-radius: .8rem;

      // Header
      $header-text-color: $fer-white; // var(--calendar-event-color-text);
      $header-background-color: var(--calendar-event-color-background);
      $star-color: $fer-white;

      // Content
      $content-background-color: $fer-gray;
      $content-text-color: $fer-black;

      position: relative;
      border: 1px solid var(--event-border-color);
      border-radius: $border-radius;

      .eventDropdown {
        overflow: hidden;
        border-radius: $border-radius;
      }

      .header {
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: left;
        padding: .75rem;
        color: $header-text-color;
        background-color: $header-background-color;

        > :first-child {
          margin-right: auto;
        }

        .star {
          $padding: .5rem;

          min-width: initial;
          margin: -$padding;
          padding: $padding;
          opacity: .85;
          color: $star-color !important;
          background: none !important;

          &:hover {
            opacity: 1;
            color: #{color.mix($star-color, $fer-yellow, 70%)} !important;
          }

          &.starSelected {
            opacity: 1;
            color: $fer-yellow !important;

            &:hover {
              color: #{color.mix($fer-yellow, $star-color, 70%)} !important;
            }
          }
        }
      }

      .contentContainer {
        display: flex;
        padding: .5rem;
        color: $fer-black;
        background-color: $content-background-color;

        .content {
          display: flex;
          align-items: center;

          .image {
            width: 3rem;
            opacity: .7;
          }

          .divider {
            height: 100%;
            margin: 0 .875rem;
            border-left: 1px solid #{$off-black};
          }

          .text {
            font-size: .875rem;
            font-weight: 600;
            color: $content-text-color;
          }
        }
      }
    }
  }
</style>
