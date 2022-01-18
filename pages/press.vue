<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="press.header" />
    </h1>

    <div :class="$style.container" class="grid">
      <div class="col-12 md:col-6">
        <h2 :class="$style.subHeader">
          <translated-text trans-key="press.press-corner.header" />
        </h2>
        <p style="line-height: 2rem;">
          <translated-text trans-key="press.press-corner.text" />
        </p>

        <h2
          :class="[
            $style.subHeader,
            $style.pressKitDownloadHeader
          ]"
        >
          <translated-text trans-key="press.press-kit" />
          <span :class="$style.pressKitDownload">
            <icon-download
              :class="$style.pressKitDownloadIcon"
            />
            <translated-text trans-key="press.press-kit.download" />
          </span>
        </h2>
        <div
          :class="$style.pressKitContainer"
        >
          <div
            v-for="item in pressKitItems"
            :key="JSON.stringify(item)"
            :class="$style.pressKitItem"
          >
            <div :class="$style.pressKitItemImage">
              <div :class="$style.pressItemImageElement">
                Image
              </div>
              <icon-download
                :class="$style.pressKitItemDownloadIcon"
              />
            </div>
            <span v-text="item.name" />
          </div>
        </div>
      </div>

      <div :class="$style.aside" class="col-12 md:col-4 md:col-offset-2">
        <div>
          <h2 :class="$style.subHeader">
            <translated-text trans-key="press.contact" />
          </h2>
          <p :class="$style.contactItemsContainer">
            <span :class="$style.contactName">
              <translated-text trans-key="press.contact.name" />
            </span>
            <span :class="$style.contactEmail">
              <translated-text trans-key="press.contact.email" />
            </span>
          </p>
        </div>

        <div>
          <h2 :class="$style.subHeader">
            <translated-text trans-key="press.for-media" />
          </h2>

          <div :class="$style.mediaReleaseContainer">
            <div
              v-for="item of mediaReleases"
              :key="item.id"
              :class="$style.mediaRelease"
            >
              <div
                :class="$style.mediaReleaseIcon"
              >
                <icon-download />
              </div>
              <div :class="$style.mediaReleaseText">
                <time
                  :datetime="item.date.toISOString()"
                  v-text="item.formattedDate"
                />
                <span v-text="item.title" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
  } from "vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import IconDownload from "~icons/ph/download-simple-light";

  export default defineComponent({
    name: "PagePress",

    components: {
      TranslatedText,
      AppMaxWidthContainer,
      IconDownload,
    },

    setup() {
      useTitle("press.header");

      return {
        mediaReleases: [
          {
            date: new Date("2020-03-27"),
            title: "Ostajemo doma: Otkazan ovogodišnji Job Fair",
          },
          {
            date: new Date("2020-03-02"),
            title: "U pohodu na karijeru - otvorena baza životopisa za 15. Job Fair!",
          },
          {
            date: new Date("2020-02-12"),
            title: "Svi govori vode u KSET: Petnaesti Job Fair u znaku tematskih Talkova",
          },
          {
            date: new Date("2020-02-03"),
            title: "Otvorene prijave za poduzeća na petnaestom Job Fairu!",
          },
          {
            date: new Date("2020-01-29"),
            title: "Karijera započinje na FER-u - poznat datum održavanja ovogodišnjeg Job Faira!",
          },
        ].map((item, i) => ({
          id: i,
          formattedDate: `${ item.date.getDate() }. ${ item.date.getMonth() + 1 }. ${ item.date.getFullYear() }.`,
          ...item,
        })),

        pressKitItems: [
          {
            name: "Job Fair Meetup logotip",
          },
          {
            name: "Fakultet elektrotehnike i računarstva logotip",
          },
          {
            name: "Klub studenata elektrotehnike logotip",
          },
          {
            name: "Centar karijera logotip",
          },
          {
            name: "Savez studenata FER-a",
          },
          {
            name: "Opis događaja",
          },
        ],
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    padding: 0 2rem;

    .subHeader {
      font-size: 1.625rem;
      font-weight: 700;
      margin-top: 0;
      color: $fer-dark-blue;

      @include media(md) {
        font-size: 1.375rem;
      }
    }

    .contactItemsContainer {
      display: flex;
      flex-direction: column;
      gap: .5rem;
    }

    .contactName,
    .contactEmail {
      opacity: .7;
      color: $fer-black;
    }

    .contactName {
      font-weight: bold;
    }

    .aside {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;

      @include media(md) {
        margin-top: 4rem;
      }
    }

    .pressKitDownloadHeader {
      display: flex;
      align-items: flex-end;
      margin-top: 3.5rem;

      @include media(md) {
        align-items: flex-start;
        flex-direction: column;
        margin-top: 3rem;
        gap: .5rem;
      }
    }

    .pressKitDownloadIcon {
      margin-bottom: .1ex;
      transition-timing-function: $transition-bounce-function;
      transition-property: transform;
      transform: translateY(0);
    }

    .pressKitDownload {
      font-size: 1rem;
      display: flex;
      align-items: flex-end;
      margin-left: auto;
      cursor: pointer;
      transition-timing-function: $transition-bounce-function;
      transition-property: transform;
      gap: .625rem;

      @include media(md) {
        margin-left: initial;
      }

      &:hover {

        .pressKitDownloadIcon {
          transform: translateY(15%);
        }
      }

      &:active {

        .pressKitDownloadIcon {
          transform: translateY(20%);
        }
      }
    }

    .pressKitContainer {
      display: grid;
      align-items: start;
      color: #{color.adjust($fer-black, $alpha: -.2)};
      grid-template-columns: 1fr 1fr;
      grid-row-gap: 3.125rem;
      grid-column-gap: 2rem;

      @include media(md) {
        grid-row-gap: 2.5rem;
        grid-template-columns: 1fr;
      }

      .pressKitItem {
        line-height: 2rem;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        text-align: center;
        gap: .5rem;

        &:hover {

          .pressKitItemImage {
            transition-duration: 0s;
            border-color: #{color.adjust($fer-black, $alpha: -.6)};

            .pressItemImageElement {
              transition-duration: 0s;
              opacity: .2;
            }

            .pressKitItemDownloadIcon {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }

        &:active {

          .pressKitItemImage {

            .pressKitItemDownloadIcon {
              transform: translateY(10%);
            }
          }
        }
      }

      .pressKitItemImage {
        position: relative;
        height: 150px;
        padding: 3rem 4.5rem;
        transition-timing-function: $transition-bounce-function;
        transition-property: border-color;
        border: 1px solid #{color.adjust($fer-black, $alpha: -.8)};
        border-radius: 4px;

        .pressItemImageElement {
          transition-property: opacity;
          opacity: .6;
        }

        .pressKitItemDownloadIcon {
          $gap: .75rem;

          position: absolute;
          top: $gap;
          right: $gap;
          transition-timing-function: $transition-bounce-function;
          transition-property: transform, opacity;
          transform: translateY(-25%);
          opacity: 0;
        }
      }
    }

    .mediaReleaseContainer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mediaReleaseIcon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .mediaRelease {
      display: flex;
      gap: 1rem;
    }

    .mediaReleaseText {
      font-size: .875rem;
      font-weight: 600;
      color: $fer-dark-blue;

      > * {
        line-height: 1.25rem;
        margin-right: .5ch;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
