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
        :time-from="10 * 60"
        :time-step="30"
        :time-to="21 * 60"
        :watch-real-time="false"
        active-view="week"
        hide-title-bar
        hide-view-selector
        hide-weekends
        selected-date="2018-11-19"
      >
        <template #event="{ event, isLastDay }">
          <dropdown-menu
            :direction="isLastDay ? 'left' : 'right'"
            arrow-border-color="var(--event-border-color)"
            arrow-color="var(--calendar-event-color-background)"
            hover
            with-arrow
          >
            <template #trigger>
              <div
                :class="$style.eventContainer"
              >
                <strong
                  :class="$style.title"
                  :data-event="JSON.stringify(event)"
                  v-text="event.title"
                />
                <br>
                <span
                  :class="$style.time"
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
              </div>
            </template>
            <template #contents>
              <div
                :class="$style.eventDropdownContainer"
              >
                <div :class="$style.eventDropdown">
                  <div :class="$style.header">
                    <span v-text="event.title" />
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
      IconStar,
    },

    setup() {
      useTitle("schedule.header");
      const events = [
        {
          start: "2018-10-30 10:30",
          end: "2018-10-30 11:30",
          title: "Doctor appointment",
          class: "talk",
        },
        {
          start: "2018-11-16 10:30",
          end: "2018-11-16 11:30",
          title: "Doctor appointment",
          class: "talk",
        },
        {
          start: "2018-11-19 10:35",
          end: "2018-11-19 11:30",
          title: "Doctor appointment",
          class: "talk",
        },
        {
          start: "2018-11-19 18:30",
          end: "2018-11-19 19:15",
          title: "Dentist appointment",
          class: "talk",
        },
        {
          start: "2018-11-20 18:30",
          end: "2018-11-20 20:30",
          title: "Crossfit",
          class: "hot-talk",
        },
        {
          start: "2018-11-21 11:00",
          end: "2018-11-21 13:00",
          title: "Brunch with Jane",
          class: "panel",
        },
        {
          start: "2018-11-21 16:30",
          end: "2018-11-21 17:40",
          title: "Swimming lesson",
          class: "workshop",
        },
        {
          start: "2018-11-23 12:30",
          end: "2018-11-23 13:00",
          title: "Macca's with Mark",
          class: "panel",
        },
        {
          start: "2018-11-24 12:30",
          end: "2018-11-24 13:00",
          title: "Macca's with Mark",
          class: "workshop",
        },
        {
          start: "2018-11-25 12:30",
          end: "2018-11-25 13:00",
          title: "Macca's with Mark",
          class: "workshop",
        },
        {
          start: "2018-11-23 16:00",
          end: "2018-11-23 18:30",
          title: "Movie time",
          class: "workshop",
        },
        {
          start: "2018-11-30 16:00",
          end: "2018-11-30 18:30",
          title: "Another movie tonight",
          class: "workshop",
        },
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

      height: calc(min(#{$content-max-width - math.div($content-padding, 2)}, 100vw) * .65);

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
      bottom: 0;
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
        bottom: .5rem;
        right: .5rem;
        width: 1.5rem;
        height: 100%;
        content: "";
        pointer-events: none;
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: contain;
        filter: drop-shadow(0 0 0 black) invert(1);
      }

      .title {
        color: $fer-white;
      }

      .time {
        display: inline-block;
      }

      .title + .time {
        margin-left: 1ch;
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
