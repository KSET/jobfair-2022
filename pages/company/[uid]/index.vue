<template>
  <app-max-width-container :class="$style.container">
    <div :class="$style.companyInfo">
      <nuxt-link
        :class="$style.backButton"
        :to="{ name: 'schedule' }"
      >
        <i class="pi pi-chevron-left" />
        <span :class="$style.backButtonText"><translated-text trans-key="back" /></span>
      </nuxt-link>
      <app-img
        :alt="`${company.brandName} logo`"
        :class="$style.companyLogo"
        :lazy-src="company.rasterLogo.thumbUrl"
        :src="company.rasterLogo.fullUrl"
        aspect-ratio="1.78"
        contain
      />
      <div :class="$style.companyDescriptionContainer">
        <h4 :class="$style.companyDescriptionHeader">
          <translated-text trans-key="company.info.about-company" />
        </h4>
        <p :class="$style.companyDescriptionText" v-text="translateFor(company, 'description').value" />
      </div>
    </div>
    <div :class="$style.eventContainer">
      <h2 :class="$style.companyName" v-text="company.brandName" />
      <template v-if="programItems">
        <TabView :class="$style.eventItems" lazy>
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

            <div :class="$style.itemHeader">
              <app-img
                :class="$style.itemIcon"
                :src="eventIcons.talk"
                alt="Talk"
                aspect-ratio="1"
              />
              <span :class="$style.itemLocation">
                utorak | 10:00 | KSET
              </span>
            </div>

            <h3 :class="$style.itemTitle" v-text="translateFor(programItems.talk, 'title').value" />

            <p :class="$style.itemDescription" v-text="translateFor(programItems.talk, 'description').value" />

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
                <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio').value" />
              </div>
            </div>
          </TabPanel>

          <TabPanel v-if="programItems.workshop">
            <template #header>
              <translated-text trans-key="company.info.program.workshop" />
            </template>

            <div :class="$style.itemHeader">
              <app-img
                :class="$style.itemIcon"
                :src="eventIcons.workshop"
                alt="Workshop"
                aspect-ratio="1"
              />
              <span :class="$style.itemLocation">
                utorak | 10:00 | KSET
              </span>
            </div>

            <h3 :class="$style.itemTitle" v-text="translateFor(programItems.workshop, 'title').value" />

            <p :class="$style.itemDescription" v-text="translateFor(programItems.workshop, 'description').value" />

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
              />
              <p :class="$style.presenterDescription" v-text="translateFor(presenter, 'bio').value" />
            </div>
          </TabPanel>

          <!--          <TabPanel v-if="programItems.panel">
                      <template #header>
                        <translated-text trans-key="company.info.program.panel" />
                      </template>

                      <pre v-text="programItems.panel" />
                    </TabPanel>-->
        </TabView>
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
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    computed,
    defineComponent,
    unref,
    useTitle,
  } from "#imports";
  import AppImg from "~/components/util/app-img.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import TranslatedText from "~/components/TranslatedText.vue";
  import EventIconWorkshop from "~/assets/images/icon/event-icons/workshops.svg?url";
  import EventIconTalk from "~/assets/images/icon/event-icons/talks.svg?url";
  import EventIconPanel from "~/assets/images/icon/event-icons/panel.svg?url";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "PageCompanyInfo",

    components: {
      TranslatedText,
      AppImg,
      AppMaxWidthContainer,
      TabView,
      TabPanel,
    },

    setup() {
      const companyStore = useCompanyStore();
      const translationsStore = useTranslationsStore();

      const company = computed(() => companyStore.companyInfo!);
      const translateFor =
        <Key extends string, Item extends Record<`${ Key }En` | `${ Key }Hr`, any>>(
          item: Item,
          key: Key,
          ) =>
          computed<Item[`${ Key }Hr` | `${ Key }En`]>(
            () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              translationsStore.currentLanguage === Language.HR
                ? item[`${ key }Hr`]
                : item[`${ key }En`],
          )
      ;


      useTitle(computed(() => `${ unref(company).brandName } - Info`));

      return {
        company,
        translateFor,
        programItems: computed<NonNullable<typeof companyStore.companyInfo>["program"]>(() => filterObject((x) => Boolean(x), unref(company).program || {})),
        eventIcons: {
          workshop: EventIconWorkshop,
          talk: EventIconTalk,
          panel: EventIconPanel,
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  $gap-size: 3.125rem;

  .container {
    display: grid;
    padding-top: 4rem;
    grid-template-columns: minmax(0, 3fr) minmax(0, 5fr);
    gap: 3rem;

    h2,
    h4 {
      color: $fer-dark-blue;
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

      .backButton {
        display: flex;
        align-items: center;

        .backButtonText {
          margin-left: .5rem;
        }
      }

      .companyLogo {
        width: 100%;
      }

      .companyDescriptionContainer {

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
      }
    }

    .eventContainer {

      .companyName {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0;
        color: $fer-dark-blue;
      }

      .eventItems {
        margin-top: 2.5rem;

        .itemHeader {
          display: flex;
          align-items: center;
          gap: 1rem;

          .itemIcon {
            $size: 1.3125rem;

            display: inline-block;
            flex: inherit;
            width: $size;
            height: $size;
            filter: invert(1);
          }

          .itemLocation {
            font-size: 1rem;
            display: none;
            opacity: .7;
            color: $fer-black;
          }
        }

        :global(.p-tabview-panels) {
          margin-top: $gap-size;
          padding: 0;
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
        }
      }
    }
  }
</style>
