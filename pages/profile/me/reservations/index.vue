<template>
  <AppUserProfileContainer>
    <h1>
      <translated-text trans-key="profile.reservations" />
    </h1>

    <strong class="flex text-lg mb-4">
      <nuxt-link :to="{ name: 'profile-me' }" class="flex align-items-center">
        <span class="pi pi-chevron-left pi-fw" />
        <translated-text trans-key="back" />
      </nuxt-link>
    </strong>

    <div>
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <InputText v-model="eventFilter" placeholder="Search" class="p-inputtext-lg w-full" />
      </span>
    </div>

    <TabMenu
      v-model:active-index="activeTabIndex"
      :model="tabs"
      :class="$style.tabMenu"
    >
      <template #item="{ item }">
        <a role="menuitem" href="#" :aria-label="String(item.label)" tabindex="0" :class="$style.tabMenuItem">
          <img v-if="item.iconImage" :src="item.iconImage" aria-hidden="true">
          <span v-if="item.icon" :class="['pi', 'pi-fw', item.icon]" />
          <template v-if="item.IconComponent">
            <component :is="item.IconComponent" />
          </template>
          <translated-text :trans-key="String(item.label)" />
        </a>
      </template>
    </TabMenu>

    <div :class="$style.items">
      <div
        v-for="event in events"
        :key="event.uid"
        :class="$style.item"
      >
        <nuxt-link
          :title="event.description"
          :to="{
            name: 'calendar-event-uid',
            params: { uid: event.calendarUid },
          }"
        >
          <p-button
            :class="[
              'p-button-text p-button-secondary',
              $style.itemHeaderButton
            ]"
          >
            <template v-if="event.companies?.length">
              <template v-if="event.companies?.length === 1">
                <AppImg
                  v-for="company in [event.companies[0]]"
                  :key="company.uid"
                  :alt="company.brandName"
                  :aspect-ratio="16/9"
                  :class="$style.itemImage"
                  :lazy-src="company.rasterLogo?.thumbUrl"
                  :src="company.rasterLogo?.fullUrl ?? ''"
                  contain
                />
              </template>
              <template v-else>
                <Carousel
                  :value="event.companies.filter((x) => x.rasterLogo)"
                  :autoplay-interval="6000"
                  :show-indicators="false"
                  :show-navigators="false"
                >
                  <template #item="{ data: company }">
                    <AppImg
                      :alt="company.brandName"
                      :aspect-ratio="16/9"
                      :class="$style.itemImage"
                      :lazy-src="company.rasterLogo.thumbUrl"
                      :src="company.rasterLogo.fullUrl"
                      contain
                    />
                  </template>
                </Carousel>
              </template>
            </template>
            <p
              v-if="event.companies?.length"
              class="m-0 opacity-60 text-lg mt-2"
              v-text="event.companies.map((x) => x.brandName).join(', ')"
            />
            <p
              class="m-0"
            >
              <strong v-text="event.title" />
            </p>
            <div
              class="flex gap-2 flex-wrap text-base align-items-center"
            >
              <event-info-display :event="event" />
            </div>
          </p-button>
        </nuxt-link>
        <div :class="$style.itemContent">
          <dl>
            <dd>
              <translated-text
                :class="$style.itemContentLabel"
                trans-key="profile.reservations.item.participants"
              />&nbsp;<span :class="$style.itemContentText" v-text="`${event.reservations}/${event.capacity}`" />
            </dd>
            <dd>
              <translated-text
                :class="$style.itemContentLabel"
                trans-key="profile.reservations.item.duration"
              />&nbsp;<span :class="$style.itemContentText" v-text="msToHuman(Number(event.end) - Number(event.start))" />
            </dd>
          </dl>
        </div>
        <div :class="$style.itemActions">
          <p-button
            :class="[
              event.reservation ? $style.signoffButton : $style.signupButton,
            ]"
            :loading="event.loading"
            @click="handleSignup($event, event)"
          >
            <translated-text v-if="event.reservation" trans-key="company.event.user.sign-off" />
            <translated-text v-else trans-key="company.event.user.sign-up" />
          </p-button>
        </div>
      </div>
    </div>
  </AppUserProfileContainer>
</template>

<script lang="ts" setup>
  import {
    useToast,
  } from "primevue/usetoast";
  import TabMenu from "primevue/tabmenu";
  import Carousel from "primevue/carousel";
  import InputText from "primevue/inputtext";
  import {
    AppUserProfileContainer,
  } from "#components";
  import AppImg from "~/components/util/app-img.vue";
  import {
    type CalendarEvent,
    useCalendarStore,
  } from "~/store/calendar";
  import useTitle from "~/composables/useTitle";
  import {
    computed,
    definePageMeta,
    reactive,
    ref,
    unref,
  } from "#imports";
  import EventInfoDisplay from "~/components/page/schedule/event-info-display.vue";
  import {
    EventType,
  } from "~/helpers/event-status";

  import EventIconWorkshop from "~/assets/images/icon/event-icons/workshops.svg?component";
  import EventIconTalk from "~/assets/images/icon/event-icons/talks.svg?component";
  import EventIconPanel from "~/assets/images/icon/event-icons/panel.svg?component";

  const calendarStore = useCalendarStore();
  const toast = useToast();

  useTitle("profile.reservations");

  definePageMeta({
    middleware: [
      async () => {
        const calendarStore = useCalendarStore();

        await calendarStore.fetchEvents();
      },
    ],
  });

  const Fuse = await import("fuse.js").then((x) => x.default);

  const tabs = [
    {
      label: "all",
    },
    {
      label: EventType.Talk,
      IconComponent: EventIconTalk,
    },
    {
      label: EventType.Workshop,
      IconComponent: EventIconWorkshop,
    },
    {
      label: EventType.Panel,
      IconComponent: EventIconPanel,
    },
    {
      label: "profile.reservations.tab.reserved",
      icon: "pi-bookmark",
    },
  ];

  const eventFilter = ref("");

  const tabFilteredEvents = computed(() => {
    const index = unref(activeTabIndex);
    const { events } = calendarStore;

    if (!(index in tabs)) {
      return [];
    }

    const type = tabs[index];

    switch (type.label) {
      case "profile.reservations.tab.reserved":
        return events.filter((event) => event.reservation);
      case "all":
        return events;
      default:
        return events.filter((event) => event.type === type.label);
    }
  });
  const filteredEvents = computed(() => {
    const events = unref(tabFilteredEvents);
    const filter = unref(eventFilter);

    if (!filter) {
      return events;
    }

    const fuse = new Fuse(events, {
      keys: [
        {
          name: "title",
          weight: 2,
        },
        {
          name: "companies.brandName",
          weight: 1,
        },
      ],
      distance: 10,
      findAllMatches: true,
    });

    return fuse.search(filter).map((x) => x.item);
  });
  const events = computed(() => reactive(unref(filteredEvents)));

  const msToHuman = (ms: number) => {
    const s = Math.floor((ms / 1000) % 60);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const str = [
      "d",
      "h",
      "min",
      "s",
    ];
    const values = [ d, h, m, s ];
    return (
      values
        .map((value, i) => value ? `${ value }${ str[i] }` : null)
        .filter(Boolean)
        .join(" ")
    );
  };

  const activeTabIndex = ref(0);

  const handleSignup = async (e: Event, event: CalendarEvent) => {
    e.preventDefault();
    await calendarStore.toggleEventReservation(event, {
      toastErrors: toast,
      updateItem: true,
    });
  };
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:color";
  @import "assets/styles/include";

  .items {
    display: grid;
    padding: 1rem;
    background-color: $fer-off-gray;
    gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));

    @include media(sm) {
      font-size: .9rem;
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .item {
      overflow: hidden;
      border-radius: 4px;
      background-color: $fer-white;
      box-shadow: #{map.get($shadows, "shadow-3")};
    }
  }

  .item .itemHeaderButton {
    font-size: 1.25rem;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    width: 100%;
    padding-inline: 1.5rem;
    text-align: left;
    color: $fer-dark-blue;
    border-radius: 0;
    gap: .5rem;
    appearance: none;
  }

  .item .itemHeaderButton :global(.p-carousel) {
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

  .item .itemContent {
    padding: .5rem 1rem;

    dl {
      line-height: 1.5;
      margin: 0;

      dd {
        margin: 0;
      }
    }
  }

  .item .itemContent .itemContentLabel {

    &::after {
      content: ":";
    }
  }

  .item .itemContent .itemContentText {
    font-weight: bold;
  }

  .item .itemImage {

    img {
      object-position: right;
    }
  }

  .item .itemActions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: .5rem 1rem;
    gap: .5rem;
  }

  .item .signupButton,
  .item .signoffButton {
    transition: background-color .2s ease;

    &:hover {
      transition: none;
    }
  }

  .item .signoffButton {
    background-color: $fer-dark-blue;

    &:hover {
      background-color: color.adjust($fer-dark-blue, $alpha: -.12);
    }
  }

  .tabMenu {
    margin-top: 2rem;
    font-size: 1.25rem;
    font-weight: bold;

    & > ul {
      display: flex;
      gap: .5rem;
      align-items: center;
    }
  }

  .tabMenu .tabMenuItem {
    display: flex;
    padding: 1rem;
    color: $fer-dark-blue;
    transition-property: color, border-color, outline-color;
    border: solid transparent;
    border-width: 0;
    border-bottom-width: 3px;
    box-sizing: border-box;
    text-transform: capitalize;
    align-items: center;
    gap: .5em;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin: .2em;
    margin-bottom: 0;
    transition-duration: .3s;
    line-height: 1;

    &:focus {
      outline: .2em solid #{color.adjust($fer-dark-blue, $alpha: -.69)};
    }

    &:hover,
    &:focus {
      transition-duration: 0s;
      border-bottom-color: color.adjust($fer-dark-blue, $alpha: -.69);
    }

    > img {
      height: 1em;
    }

    > svg {
      height: 1em;
      fill: currentcolor;
    }
  }

  .tabMenu :global(.p-highlight) {

    .tabMenuItem {
      color: $fer-yellow;
      border-bottom-color: $fer-yellow;

      &:hover,
      &:focus {
        outline-color: #{color.adjust($fer-yellow, $alpha: -.69)};
      }
    }
  }

  .tabMenu :global(.p-tabmenu-ink-bar) {
    display: none !important;
  }

  .tabMenu :global(.p-tabmenu-nav) {
    flex-wrap: wrap;
  }
</style>
