<template>
  <app-max-width-container :class="$style.container">
    <div :class="$style.companyInfo">
      <nuxt-link
        :class="$style.backButton"
        :to="isScheduleShown ? { name: 'schedule' } : { name: 'participants' }"
      >
        <strong>
          <i class="pi pi-chevron-left" />
          <span :class="$style.backButtonText">
            <translated-text trans-key="back" />
          </span>
        </strong>
      </nuxt-link>
      <template v-if="company.rasterLogo">
        <app-img
          :alt="`${company.brandName} logo`"
          :class="$style.companyLogo"
          :lazy-src="company.rasterLogo!.thumbUrl"
          :src="company.rasterLogo!.fullUrl"
          aspect-ratio="1.78"
          contain
        />
      </template>
      <template v-else>
        <div :class="$style.companyLogo" />
      </template>
      <div :class="$style.companyDescriptionContainer">
        <h4 :class="$style.companyDescriptionHeader">
          <translated-text trans-key="company.info.about-company" />
        </h4>
        <p :class="$style.companyDescriptionText" v-text="translateFor(company, 'description')" />
        <hr>
        <div :class="$style.socialIconContainer">
          <div
            v-for="social in companySocials"
            :key="social.icon"
            :class="$style.socialIcon"
          >
            <a
              :class="$style.socialIconLink"
              :href="social.href"
              rel="noopener noreferrer"
              target="_blank"
            >
              <app-img
                :alt="social.name"
                :src="social.icon"
                contain
              />
            </a>
          </div>
        </div>
      </div>
    </div>
    <div :class="$style.eventContainer">
      <h2 :class="$style.companyName" v-text="company.brandName" />
      <template v-if="!isScheduleShown">
        <h2>
          <translated-text trans-key="company.info.schedule-not-shown.title" />
        </h2>
        <p>
          <translated-text trans-key="company.info.schedule-not-shown.text" />
        </p>
      </template>
      <template v-else-if="programItems">
        <TabView
          v-model:activeIndex="activeIndex"
          :class="$style.eventItems"
          lazy
        >
          <!--          <TabPanel v-if="programItems.booth">
            <template #header>
              <translated-text trans-key="company.info.program.booth" />
            </template>

            <pre v-text="programItems.booth" />
          </TabPanel>-->

          <TabPanel v-if="programItems.talk">
            <template #header>
              <translated-text trans-key="company.info.program.talk" />
            </template>

            <div v-if="programItems.talk.event" :class="$style.itemHeader">
              <event-info-display :event="{ ...programItems.talk.event!, type: EventType.Talk }" />
              <p-button
                v-if="loggedIn"
                :class="{
                  [$style.signupButton]: !programItems.talk.reservation,
                  [$style.signoffButton]: programItems.talk.reservation,
                }"
                :loading="signupLoading"
                @click="handleSignup('talk')"
              >
                <translated-text v-if="programItems.talk.reservation" trans-key="company.event.user.sign-off" />
                <translated-text v-else trans-key="company.event.user.sign-up" />
              </p-button>
              <nuxt-link v-else :to="joinNowRoute">
                <p-button
                  :class="$style.signupButton"
                >
                  <translated-text trans-key="company.event.user.sign-up" />
                </p-button>
              </nuxt-link>
            </div>

            <h3 :class="$style.itemTitle" v-text="translateFor(programItems.talk, 'title')" />

            <p :class="$style.itemDescription" v-text="translateFor(programItems.talk, 'description')" />

            <h4>
              <translated-text trans-key="company.info.program.about-presenters" />
            </h4>
            <div
              v-for="presenter in programItems.talk.presenters"
              :key="presenter.photo.fullUrl"
            >
              <div class="mt-2">
                <h5 :class="$style.presenterName" v-text="`${presenter.firstName} ${presenter.lastName}`" />
                <app-img
                  :alt="`${presenter.firstName} ${presenter.lastName}`"
                  :class="$style.presenterPhoto"
                  :lazy-src="presenter.photo.thumbUrl"
                  :src="presenter.photo.fullUrl"
                />
                <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio')" />
              </div>
            </div>
          </TabPanel>

          <TabPanel v-if="programItems.workshop">
            <template #header>
              <translated-text trans-key="company.info.program.workshop" />
            </template>

            <div v-if="programItems.workshop.event" :class="$style.itemHeader">
              <event-info-display :event="{ ...programItems.workshop.event!, type: EventType.Workshop }" />
              <p-button
                v-if="loggedIn"
                :class="{
                  [$style.signupButton]: !programItems.workshop.reservation,
                  [$style.signoffButton]: programItems.workshop.reservation,
                }"
                :loading="signupLoading"
                @click="handleSignup('workshop')"
              >
                <translated-text v-if="programItems.workshop.reservation" trans-key="company.event.user.sign-off" />
                <translated-text v-else trans-key="company.event.user.sign-up" />
              </p-button>
              <nuxt-link v-else :to="joinNowRoute">
                <p-button
                  :class="$style.signupButton"
                >
                  <translated-text trans-key="company.event.user.sign-up" />
                </p-button>
              </nuxt-link>
            </div>

            <h3 :class="$style.itemTitle" v-text="translateFor(programItems.workshop, 'title')" />

            <p :class="$style.itemDescription" v-text="translateFor(programItems.workshop, 'description')" />

            <template v-for="note in [ translateFor(programItems.workshop, 'notes') ]">
              <template v-if="note">
                <div :key="note">
                  <h4>
                    <translated-text trans-key="company.info.program.notes" />
                  </h4>
                  <p :class="$style.itemDescription" v-text="note" />
                </div>
              </template>
            </template>

            <h4>
              <translated-text trans-key="company.info.program.about-presenters" />
            </h4>
            <div
              v-for="presenter in programItems.workshop.presenters"
              :key="presenter.photo.fullUrl"
              :class="$style.presenter"
            >
              <h5 :class="$style.presenterName" v-text="`${presenter.firstName} ${presenter.lastName}`" />
              <app-img
                :alt="`${presenter.firstName} ${presenter.lastName}`"
                :class="$style.presenterPhoto"
                :lazy-src="presenter.photo.thumbUrl"
                :src="presenter.photo.fullUrl"
                cover
              />
              <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio')" />
            </div>
          </TabPanel>

          <TabPanel v-if="programItems.panel">
            <template #header>
              <translated-text trans-key="company.info.program.panel" />
            </template>

            <div v-if="programItems.panel.event" :class="$style.itemHeader">
              <event-info-display :event="{ ...programItems.panel.event!, type: EventType.Panel }" />
              <p-button
                v-if="loggedIn"
                :class="{
                  [$style.signupButton]: !programItems.panel.reservation,
                  [$style.signoffButton]: programItems.panel.reservation,
                }"
                :loading="signupLoading"
                @click="handleSignup('panel')"
              >
                <translated-text v-if="programItems.panel.reservation" trans-key="company.event.user.sign-off" />
                <translated-text v-else trans-key="company.event.user.sign-up" />
              </p-button>
              <nuxt-link v-else :to="joinNowRoute">
                <p-button
                  :class="$style.signupButton"
                >
                  <translated-text trans-key="company.event.user.sign-up" />
                </p-button>
              </nuxt-link>
            </div>

            <h3 :class="$style.itemTitle" v-text="programItems.panel.name" />

            <p :class="$style.itemDescription" v-text="programItems.panel.description" />

            <h4>
              <translated-text trans-key="company.info.program.about-presenters" />
            </h4>

            <div
              v-for="presenter in company.program.panelParticipants"
              :key="presenter.photo.fullUrl"
              :class="$style.presenter"
            >
              <h5 :class="$style.presenterName" v-text="`${presenter.firstName} ${presenter.lastName}`" />
              <app-img
                :alt="`${presenter.firstName} ${presenter.lastName}`"
                :class="$style.presenterPhoto"
                :lazy-src="presenter.photo.thumbUrl"
                :src="presenter.photo.fullUrl"
              />
              <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio')" />
            </div>

            <template v-if="panelCompanies.length > 0">
              <h4>
                <translated-text trans-key="company.info.program.other-panelists" />
              </h4>

              <div
                :class="$style.companyChips"
              >
                <nuxt-link
                  v-for="otherCompany in panelCompanies"
                  :key="otherCompany.uid"
                  :to="{ name: 'company-uid', params: { uid: otherCompany.uid }, query: { tab: 'panel' } }"
                  target="_blank"
                >
                  <div :class="$style.companyChip">
                    <app-img
                      :alt="`${otherCompany.brandName} logo`"
                      :class="$style.companyChipImage"
                      :lazy-src="otherCompany.rasterLogo.thumbUrl"
                      :src="otherCompany.rasterLogo.fullUrl"
                      contain
                    />
                    <div class="p-chip-text" v-text="otherCompany.brandName" />
                  </div>
                </nuxt-link>
              </div>
            </template>
          </TabPanel>
        </TabView>
      </template>
      <template v-else>
        <h2>
          <translated-text trans-key="company.info.no-program-items.title" />
        </h2>
        <p>
          <translated-text trans-key="company.info.no-program-items.text" />
        </p>
      </template>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    filterObject,
  } from "rambdax";
  import TabView from "primevue/tabview";
  import TabPanel from "primevue/tabpanel";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    computed,
    defineComponent,
    ref,
    unref,
    useRoute,
    useHeadMetadata,
    watch,
    useRouter,
  } from "#imports";
  import {
    useJoinNowRoute as useJoinNow,
  } from "~/composables/useJoinNowRoute";
  import AppImg from "~/components/util/app-img.vue";
  import EventInfoDisplay from "~/components/page/schedule/event-info-display.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    type Dict,
  } from "~/helpers/type";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    EventType,
  } from "~/helpers/event-status";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useCalendarStore,
  } from "~/store/calendar";

  export default defineComponent({
    name: "PageCompanyInfo",

    components: {
      TranslatedText,
      AppImg,
      AppMaxWidthContainer,
      TabView,
      TabPanel,
      EventInfoDisplay,
    },

    setup() {
      const route = useRoute();
      const router = useRouter();
      const companyStore = useCompanyStore();
      const translationsStore = useTranslationsStore();
      const userStore = useUserStore();
      const seasonsStore = useSeasonsStore();
      const calendarStore = useCalendarStore();
      const toast = useToast();

      const company = computed(() => companyStore.companyInfo!);

      type TCompanyProgram = NonNullable<NonNullable<typeof companyStore.companyInfo>["program"]>;
      type TReservableEntryName = keyof TCompanyProgram & ("talk" | "workshop" | "panel");

      const programItemsEmpty = {} as Partial<TCompanyProgram>;
      const programItems = computed(() => filterObject(Boolean, unref(company)?.program ?? programItemsEmpty) as Partial<TCompanyProgram>);

      const tabs: Record<string, number> = Object.fromEntries(
        [
          "talk",
          "workshop",
          "panel",
        ]
          .filter((x) => (unref(programItems) as Dict | null)?.[x])
          .map((x, i) => [ x, i ] as const),
      );

      const preselectedTab = String(route.query.tab) || "talk";
      const activeIndex = ref(tabs[preselectedTab] ?? 0);
      const activeTab = computed(() => Object.keys(tabs)[activeIndex.value]);

      watch(
        activeTab,
        (tab) => {
          void router.replace({
            query: {
              ...route.query,
              tab,
            },
          });
        },
        {
          immediate: true,
        },
      );

      useHeadMetadata(computed(() => {
        const { brandName } = unref(company);
        const info = {
          title: `${ brandName } - Info`,
          description: undefined,
        } as {
          title: string,
          description?: string,
        };

        switch (unref(activeTab)) {
          case "talk": {
            const item = unref(programItems).talk;
            if (item) {
              info.title = `[Talk] ${ brandName }: ${ unref(translationsStore.translateFor(item, "title")) }`;
              info.description = unref(translationsStore.translateFor(item, "description"));
            }
            break;
          }

          case "workshop": {
            const item = unref(programItems).workshop;
            if (item) {
              info.title = `[Workshop] ${ brandName }: ${ unref(translationsStore.translateFor(item, "title")) }`;
              info.description = unref(translationsStore.translateFor(item, "description"));
            }
            break;
          }

          case "panel": {
            const item = unref(programItems).panel;
            if (item) {
              info.title = `[Panel] ${ brandName }: ${ item.name }`;
              info.description = item.description;
            }
            break;
          }
        }

        return info;
      }), false);

      const globResult = import.meta.glob([
        "../../../assets/images/page/company-info/icons/socials/*.png",
      ], { eager: true }) as unknown as Record<string, { default: string, }>;

      const socialIcons =
        Object.fromEntries(
          Object
            .entries(globResult)
            .filter(([ key ]) => key.startsWith("../../../assets/images/page/company-info/icons/socials"))
            .map(([ key, value ]) => [
              key.replace(/.*\/icon-(.*)\..*?$/, "$1"),
              value.default,
            ])
          ,
        )
      ;

      const companySocials = [
        unref(company).website && {
          name: "Website",
          href: unref(company).website,
          icon: socialIcons.web,
        },
        unref(company).linkedIn && {
          name: "LinkedIn",
          href: unref(company).linkedIn,
          icon: socialIcons.ln,
        },
        unref(company).instagram && {
          name: "Instagram",
          href: unref(company).instagram,
          icon: socialIcons.ig,
        },
        unref(company).facebook && {
          name: "Facebook",
          href: unref(company).facebook,
          icon: socialIcons.fb,
        },
      ].filter(Boolean);

      const signupLoading = ref(false);

      return {
        loggedIn: computed(() => userStore.isLoggedIn),
        isScheduleShown: computed(() => seasonsStore.isScheduleShown),
        signupLoading,
        activeIndex,
        company,
        translateFor: computed(() => translationsStore.translateFor),
        programItems,
        EventType,
        panelCompanies: computed(() => (unref(programItems)?.panel?.companies || []).filter((x) => x.uid !== unref(company).uid)),
        joinNowRoute: useJoinNow(),
        companySocials,
        formatWebsite(website: string) {
          try {
            const url = new URL(website);

            return url.hostname;
          } catch {
            return website;
          }
        },
        async handleSignup(type: TReservableEntryName) {
          const loggedIn = userStore.isLoggedIn;

          if (!loggedIn) {
            return;
          }

          const eventType = (() => {
            switch (type) {
              case "talk":
                return EventType.Talk;
              case "workshop":
                return EventType.Workshop;
              case "panel":
                return EventType.Panel;
            }

            return null;
          })();

          if (!eventType) {
            return;
          }

          const event = unref(company).program?.[type];

          if (!event) {
            return;
          }

          const uid = unref(programItems)?.[type]?.uid;

          if (!uid) {
            return;
          }

          signupLoading.value = true;
          const resp = await calendarStore.toggleEventReservation(
            {
              uid,
              type: eventType,
              reservation: event?.reservation,
            },
            {
              refetchEvents: false,
              toastErrors: toast,
            },
          );
          signupLoading.value = false;

          if (resp?.entity) {
            event.reservation = resp.entity.status;
          }
        },
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

      .eventContainer {

        .eventItems {
          margin-top: 0;

          :global(.p-tabview-panels) {
            margin-top: $gap-size;
          }
        }
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

  .companyLogo {
    width: 100%;
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

  .eventItems {
    margin-top: 2.5rem;

    :global(.p-tabview-panels) {
      margin-top: $gap-size;
      padding: 0;
    }

    :global(.p-tabview-nav-link) {
      padding: .5rem 1rem;
    }

    :global(.p-tabview-panel) {
      $presenter-photo-size: 4rem;
      $presenter-bio-offset: .75rem;

      .itemTitle {
        font-size: 1.875rem;
        font-weight: 700;
        margin-top: 1rem;
        margin-bottom: 0;
        color: $fer-dark-blue;
      }

      .itemDescription {
        white-space: break-spaces;
      }

      h4 {
        margin-top: $gap-size;
        margin-bottom: 0;
        text-transform: uppercase;
      }

      .presenter {
        display: inline-block;
        margin-top: .5rem;
        padding-top: .5rem;
      }

      .presenter + .presenter {
        border-top: 1px solid #{$fer-gray};
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

      .companyChips {
        display: flex;
        margin-top: 1rem;
        gap: 1rem;

        > a {
          display: inline-flex;
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
        -webkit-box-align: center;
        -moz-box-align: center;

        .companyChipImage {
          width: 2.5rem;
          height: 2.5rem;
          margin-right: .5rem;
        }

        &:hover {
          background-color: #{color.adjust($fer-dark-blue, $alpha: -.9)};
        }
      }

      .signupButton, .signoffButton {
        font-size: 1.2rem;
        font-weight: bold;
        padding: .85rem 1rem;
        transition: background-color .2s ease;
      }

      .signoffButton {
        background-color: $fer-dark-blue;
      }
    }
  }

  .itemHeader {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .itemIcon {
    $size: 1.3125rem;

    display: inline-block;
    flex: inherit;
    width: $size;
  }

  .itemLocation {
    font-size: 1rem;
    opacity: .7;
    color: $fer-black;
  }

  .socialIconContainer {
      display: flex;
      gap: .875rem;
      max-width: 12em;

      .socialIcon {
        flex: 1;
        width: auto;
        height: 1.3125rem;
        padding: 0;
        transition-property: opacity;

        .socialIconLink {
          width: 100%;
          height: 100%;
        }

        &:hover {
          opacity: .8;
        }
      }
    }
</style>
