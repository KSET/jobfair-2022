<template>
  <app-max-width-container :not-found="!isScheduleShown">
    <div :class="$style.container">
      <h1>
        <translated-text trans-key="schedule.header" />
      </h1>

      <div v-if="events.length > 0" :class="$style.calendarContainer">
        <vue-calendar
          v-if="!isMd"
          :click-to-navigate="false"
          :dblclick-to-navigate="false"
          :disable-views="['years', 'year', 'month', 'day']"
          :events="events"
          :hide-weekdays="unusedDays"
          :selected-date="events[0].start"
          :split-days="splitDays"
          :time-from="(minHours - (timeStepMinutes / 60)) * 60"
          :time-step="timeStepMinutes"
          :time-to="(maxHours + (timeStepMinutes / 60)) * 60"
          :watch-real-time="false"
          active-view="week"
          hide-title-bar
          hide-view-selector
        >
          <template #event="{ event }">
            <component
              :is="event.hasEvent ? 'a' : 'div'"
              :class="$style.eventContainer"
              :href="$router.resolve({ name: 'calendar-event-uid', params: { uid: event.uid } }).href"
              target="_blank"
              :title="event.text ? `${event.title}\n----------\n${event.text}` : event.title"
            >
              <strong
                :class="$style.eventTitle"
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
                <i class="pi pi-map-marker" />
                {{ event.location }}
              </div>
              <div
                v-if="event.text"
                :class="$style.eventText"
                v-text="event.text"
              />
            </component>
          </template>
        </vue-calendar>
        <template v-else>
          <vue-calendar
            v-for="day in usedDays"
            :key="day"
            :click-to-navigate="false"
            :dblclick-to-navigate="false"
            :disable-views="['years', 'year', 'month', 'day']"
            :events="events"
            :hide-weekdays="[ ...unusedDays, day ]"
            :selected-date="events[0].start"
            :split-days="splitDays"
            :time-from="(minHours - (timeStepMinutes / 60)) * 60"
            :time-step="timeStepMinutes"
            :time-to="(maxHours + (timeStepMinutes / 60)) * 60"
            :watch-real-time="false"
            active-view="week"
            hide-title-bar
            hide-view-selector
            hide-weekends
          >
            <template #event="{ event }">
              <component
                :is="event.hasEvent ? 'a' : 'div'"
                :class="$style.eventContainer"
                :href="$router.resolve({ name: 'calendar-event-uid', params: { uid: event.uid } }).href"
                target="_blank"
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
                  <i class="pi pi-map-marker" />
                  {{ event.location }}
                </div>
                <div
                  v-if="event.text"
                  :class="$style.eventText"
                  v-text="event.text"
                />
              </component>
            </template>
          </vue-calendar>
        </template>
      </div>
      <div v-else>
        <h2>
          <translated-text trans-key="schedule.no-events" />
        </h2>
      </div>
    </div>
    <div v-if="events.length > 0" class="text-right my-2 text-xl">
      <a href="/api/user/calendar/event/all.ics">
        <translated-text trans-key="schedule.as-ical.public" />
      </a>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import {
    groupBy,
    map,
  } from "rambda";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import VueCalendar from "~/components/external/VueCalendar.vue";
  import useTitle from "~/composables/useTitle";
  import DropdownMenu from "~/components/util/dropdown-menu.vue";
  // noinspection TypeScriptCheckImport
  import IconStar from "~icons/grommet-icons/star";
  import AppImg from "~/components/util/app-img.vue";
  import {
    useBreakpoints,
  } from "~/composables/useBreakpoints";
  import {
    computed,
    unref,
    useQuery,
    useStyleTag,
  } from "#imports";
  import {
    capitalize,
  } from "~/helpers/string";
  import {
    type IPageScheduleBaseQuery,
    type IPageScheduleBaseQueryVariables,
    PageScheduleBase,
  } from "~/graphql/schema";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    useSeasonsStore,
  } from "~/store/seasons";

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

    async setup() {
      useTitle("schedule.header");

      const translationsStore = useTranslationsStore();
      const seasonsStore = useSeasonsStore();

      const events = await useQuery<IPageScheduleBaseQuery, IPageScheduleBaseQueryVariables>({
        query: PageScheduleBase,
      })()
        .then((resp) => resp?.data?.calendar ?? [])
        .then(
          (resp) =>
            map(
              (x) => ({
                ...x,
                start: new Date(String(x.start as unknown)),
                end: new Date(String(x.end as unknown)),
                class: x.type,
                noGroup: !x.grouped,
                split: 0,
              }),
              resp,
            )
              .sort(
                (a, b) => Number(a.start) - Number(b.start),
              )
              .filter((x) => {
                const is = x.start <= x.end;

                if (!is) {
                  console.error("Start date is after end date", x);
                }

                return is;
              })
          ,
        )
      ;

      const otherContent = [ "panel", "hot-talk", "loosen-up", "other" ];
      const groupedEvents = groupBy(
        (event) => event.class!,
        events.filter((event) => event.class && !otherContent.includes(event.class) && !event.noGroup),
      );

      const splitDays =
        Object
          .entries(groupedEvents)
          .map(([ rawKey, events ], i) => {
            const key = rawKey.replace(/-/g, " ");
            const id = i + 1;

            for (const event of events) {
              event.split = id;
            }

            return {
              id,
              label: capitalize(key),
              class: `${ key }-split`,
            };
          })
      ;

      splitDays.push({
        id: splitDays.length + 1,
        label: "Other content",
        class: "other-split",
      });

      for (const event of events) {
        if (!event.split) {
          event.split = splitDays.length;
        }
      }

      const eventTimeFormatter = computed(() => new Intl.DateTimeFormat(
        translationsStore.currentLanguageIso,
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ));

      const availableDays = [ 1, 2, 3, 4, 5, 6, 7 ] as const;
      const unusedDays = new Set<number>(availableDays);
      const usedDays = new Set<number>();
      let minHours = 24;
      let maxHours = 0;
      for (const event of events) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        unusedDays.delete(start.getDay() || 7);
        unusedDays.delete(end.getDay() || 7);
        usedDays.add(start.getDay() || 7);
        usedDays.add(end.getDay() || 7);
        minHours = Math.min(minHours, start.getHours(), end.getHours());
        maxHours = Math.max(maxHours, start.getHours(), end.getHours());
      }

      const maxOverlapping =
        (
          ranges: { start: Date | string, end: Date | string, }[],
        ) =>
          ranges
            .flatMap(
              (range) => [
                [ new Date(range.start), "x" ],
                [ new Date(range.end), "y" ],
              ] as const
              ,
            )
            .sort((a, b) => a[0].getTime() - b[0].getTime())
            .reduce(
              ([ ans, count ], [ , type ]) => {
                const step = "x" === type ? 1 : -1;
                const newCount = count + step;

                return [ Math.max(ans, newCount), newCount ];
              },
              [ 0, 0 ],
            )
            .shift()!
      ;

      const maxOverlappingByEvent = map(maxOverlapping, groupedEvents);

      useStyleTag(
        Object
          .entries(maxOverlappingByEvent)
          .map(([ type, maxOverlapping ]) =>
            `
            .vuecal__cell-split.${ type }-split {
              flex-grow: ${ maxOverlapping } !important;
            }
            `,
          )
          .join("\n")
        ,
      );

      const isMd = useBreakpoints().smaller("md");

      return {
        isScheduleShown: computed(() => seasonsStore.isScheduleShown),
        events,
        splitDays,
        isMd,
        unusedDays: Array.from(unusedDays),
        usedDays: Array.from(usedDays).sort((a, b) => b - a),
        minHours,
        maxHours,
        timeStepMinutes: Math.round(Math.min(...events.map((event) => (event.end.getTime() - event.start.getTime()) / 1000 / 60)) / 2),
        maxOverlappingByEvent,

        formatEventTime: (date: Date): string =>
          unref(eventTimeFormatter).format(date)
        ,
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

    max-width: 90vw;

    @include media(lg) {
      max-width: 95vw;
    }

    @include media(md) {
      min-height: calc(2.5 * min(#{$content-max-width - math.div($content-padding, 2)}, 100vw) * .65);
    }

    .calendarContainer {
      $cell-shrink-by: 10px;
      $cell-offset-left: 3px;

      position: relative;
      width: 100%;
      height: calc(min(#{$content-max-width - math.div($content-padding, 2)}, 100vw) * .65);

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
              color: #{pick-visible-color($color, $fer-black, $fer-white)};
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

        .vuecal__cell-split {
          flex-basis: 0;
          flex-grow: 1;
          flex-shrink: 1;
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

        @include media(md) {
          display: none;
        }
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
        margin: .5em 0 0;
      }

      .eventText {
        font-size: .9em;
        font-style: italic;
      }

      .eventLocation + .eventText {
        margin-top: .1em;
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
