<template>
  <div :class="$style.container">
    <client-only>
      <vue-cal
        disable-date-prototypes
        v-bind="$attrs"
      >
        <template #weekday-heading="{ heading }">
          {{ formatWeekdayHeading(heading.date) }}
        </template>

        <template #event="{ event }">
          <slot
            :event="event"
            :is-last-day="isLastDay(event.start, $attrs['hide-weekends'] !== undefined || $attrs['hideWeekends'] !== undefined)"
            name="event"
          />
        </template>
      </vue-cal>
    </client-only>
  </div>
</template>

<script lang="ts">
  import {
    defineAsyncComponent,
    defineComponent,
  } from "vue";
  import {
    Component,
  } from "@nuxt/schema";

  // noinspection TypeScriptCheckImport
  export default defineComponent({
    components: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: No type definitions available
      VueCal: defineAsyncComponent(() => import("vue-cal") as Component),
    },

    inheritAttrs: false,

    /*
     props: {
     activeView: {
     type: [ String ],
     required: false,
     default: always("week"),
     },
     allDayBarHeight: {
     type: [ String, Number ],
     required: false,
     default: always("25px"),
     },
     cellClickHold: {
     type: [ Boolean ],
     required: false,
     default: always(true),
     },
     cellContextmenu: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     clickToNavigate: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     dblclickToNavigate: {
     type: [ Boolean ],
     required: false,
     default: always(true),
     },
     disableDays: {
     type: [ Array ],
     required: false,
     default: always([]),
     },
     disableViews: {
     type: [ Array ],
     required: false,
     default: always([]),
     },
     dragToCreateEvent: {
     type: [ Boolean ],
     required: false,
     default: always(true),
     },
     dragToCreateThreshold: {
     type: [ Number ],
     required: false,
     default: always(15),
     },
     editableEvents: {
     type: [ Boolean, Object ],
     required: false,
     default: always(false),
     },
     events: {
     type: [ Array ],
     required: false,
     default: always([]),
     },
     eventsCountOnYearView: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     eventsOnMonthView: {
     type: [ Boolean, String ],
     required: false,
     default: always(false),
     },
     hideBody: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     hideTitleBar: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     hideViewSelector: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     hideWeekdays: {
     type: [ Array ],
     required: false,
     default: always([]),
     },
     hideWeekends: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     locale: {
     type: [ String ],
     required: false,
     default: always("en"),
     },
     maxDate: {
     type: [ String, Date ],
     required: false,
     default: always(""),
     },
     minCellWidth: {
     type: [ Number ],
     required: false,
     default: always(0),
     },
     minDate: {
     type: [ String, Date ],
     required: false,
     default: always(""),
     },
     minEventWidth: {
     type: [ Number ],
     required: false,
     default: always(0),
     },
     minSplitWidth: {
     type: [ Number ],
     required: false,
     default: always(0),
     },
     onEventClick: {
     type: [ Function ],
     required: false,
     default: always(null),
     },
     onEventCreate: {
     type: [ Function ],
     required: false,
     default: always(null),
     },
     onEventDblclick: {
     type: [ Function ],
     required: false,
     default: always(null),
     },
     overlapsPerTimeStep: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     resizeX: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     selectedDate: {
     type: [ String, Date ],
     required: false,
     default: always(""),
     },
     showAllDayEvents: {
     type: [ Boolean, String ],
     required: false,
     default: always(false),
     },
     showWeekNumbers: {
     type: [ Boolean, String ],
     required: false,
     default: always(false),
     },
     small: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     snapToTime: {
     type: [ Number ],
     required: false,
     default: always(null),
     },
     specialHours: {
     type: [ Object ],
     required: false,
     default: always({}),
     },
     splitDays: {
     type: [ Array ],
     required: false,
     default: always([]),
     },
     startWeekOnSunday: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     stickySplitLabels: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     time: {
     type: [ Boolean ],
     required: false,
     default: always(true),
     },
     timeCellHeight: {
     type: [ Number ],
     required: false,
     default: always(40),
     },
     timeFormat: {
     type: [ String ],
     required: false,
     default: always(""),
     },
     timeFrom: {
     type: [ Number ],
     required: false,
     default: always(0),
     },
     timeStep: {
     type: [ Number ],
     required: false,
     default: always(30),
     },
     timeTo: {
     type: [ Number ],
     required: false,
     default: always(24 * 60),
     },
     todayButton: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     transitions: {
     type: [ Boolean ],
     required: false,
     default: always(true),
     },
     twelveHour: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     xsmall: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     watchRealTime: {
     type: [ Boolean ],
     required: false,
     default: always(false),
     },
     },
     */

    setup() {
      const dateFormatter = new Intl.DateTimeFormat(
        undefined,
        {
          weekday: "short",
          month: "numeric",
          day: "numeric",
        },
      );

      return {
        formatWeekdayHeading(date: Date): string {
          return dateFormatter.format(date);
        },

        isLastDay(date: Date, considerWeekends: unknown): boolean {
          const day = date.getDay();

          if (considerWeekends) {
            return 0 === day || 5 <= day;
          }

          return 0 === day;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    display: contents;

    :global {
      @import "node_modules/vue-cal/dist/vuecal";

      .vuecal__cell--selected {
        background-color: rgba($fer-dark-blue, .03);
      }

      .vuecal__event {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .vuecal__no-event {
        display: none;
      }
    }
  }
</style>
