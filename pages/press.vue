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
          <span class="flex-1">
            <translated-text trans-key="press.press-kit" />
          </span>
          <a
            :class="$style.pressKitDownload"
            href="/Job%20Fair%20-%20Press%20kit.zip"
            target="_blank"
          >
            <icon-download
              :class="$style.pressKitDownloadIcon"
            />
            <translated-text trans-key="press.press-kit.download" />
          </a>
        </h2>
        <div
          :class="$style.pressKitContainer"
        >
          <a
            v-for="item in pressKitItems"
            :key="JSON.stringify(item)"
            :class="$style.pressKitItem"
            :href="item.file"
            download
            target="_blank"
          >
            <div :class="$style.pressKitItemImage">
              <div
                :class="$style.pressItemImageElement"
                :style="{
                  backgroundImage: `url('${item.image}')`
                }"
              />
              <icon-download
                :class="$style.pressKitItemDownloadIcon"
              />
            </div>
            <translated-text :trans-key="item.name" />
          </a>
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
              <a :href="`mailto:${contactEmail}`">
                <translated-text
                  v-model="contactEmail"
                  trans-key="press.contact.email"
                />
              </a>
            </span>
          </p>
        </div>

        <div>
          <h2 :class="$style.subHeader">
            <translated-text trans-key="press.for-media" />
          </h2>

          <div :class="$style.mediaReleaseContainer">
            <a
              v-for="item of mediaReleases"
              :key="item.uid"
              :class="$style.mediaRelease"
              :href="item.downloadLink"
              target="_blank"
            >
              <div
                :class="$style.mediaReleaseIcon"
              >
                <icon-download />
              </div>
              <div :class="$style.mediaReleaseText">
                <time
                  :datetime="item.published.toISOString()"
                  :title="item.published.toLocaleDateString()"
                  v-text="item.formattedDate"
                />
                <span v-text="item.title" />
              </div>
            </a>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 mt-7 md:mt-8">
        <h2 :class="$style.subHeader">
          <translated-text trans-key="press.press-gallery.header" />
        </h2>
        <p style="line-height: 2rem;">
          <translated-text trans-key="press.press-gallery.text" />
        </p>
        <div :class="$style.galleryContainer">
          <div
            v-for="galleryItem in gallery"
            :key="galleryItem.url"
            :class="$style.galleryItem"
          >
            <p-image
              :class="$style.galleryImage"
              :src="galleryItem.url"
              alt="img"
              preview
            />
          </div>
        </div>
      </div>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    ref,
  } from "vue";
  import Image from "primevue/image";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import IconDownload from "~icons/ph/download-simple-light";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    IPressReleasesQuery,
    IPressReleasesQueryVariables,
    PressReleases,
  } from "~/graphql/schema";
  import {
    useGalleryStore,
  } from "~/store/gallery";
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Type declaration stuff
  const PreviewIcons = import.meta.globEager("../assets/images/page/press/*.png");

  export default defineComponent({
    name: "PagePress",

    components: {
      PImage: Image,
      TranslatedText,
      AppMaxWidthContainer,
      IconDownload,
    },

    async setup() {
      useTitle("press.header");

      const galleryStore = useGalleryStore();

      const resp = await useQuery<IPressReleasesQuery, IPressReleasesQueryVariables>({
        query: PressReleases,
      })();

      const releases = resp?.data?.pressReleases || [];

      const previewIcons =
        Object.fromEntries(
          Object
            .entries(PreviewIcons)
            .map(([ k, v ]) => [ k.split("/").pop()?.replace(/\.[^.]*/, "") ?? "", v.default ])
          ,
        )
      ;

      return {
        contactEmail: ref(""),

        gallery: computed(() => galleryStore.items),

        mediaReleases:
          releases
            .map((release) => ({
              ...release,
              published: new Date(String(release.published)),
            }))
            .map((release) => ({
              ...release,
              formattedDate: `${ release.published.getDate() }. ${ release.published.getMonth() + 1 }. ${ release.published.getFullYear() }.`,
              downloadLink: release.file ? `/api/file/${ release.file.uid }` : "#",
            })),

        pressKitItems: [
          {
            name: "press.press-kit.item.jobfair-logo",
            image: previewIcons.JobFair,
            file: "/tmp/press/jf logo.jpg",
          },
          {
            name: "press.press-kit.item.fer-logo",
            image: previewIcons.FER,
            file: "/tmp/press/FER_logo_1.png",
          },
          {
            name: "press.press-kit.item.kset-logo",
            image: previewIcons.KSET,
            file: "/tmp/press/KSET logo crni.png",
          },
          {
            name: "press.press-kit.item.ckf-logo",
            image: previewIcons.CKF,
            file: "/tmp/press/CKF_bijela.jpg",
          },
          {
            name: "press.press-kit.item.ssfer-logo",
            image: previewIcons.SSFER,
            file: "/tmp/press/Job-Fair-org-SSFER-color.png",
          },
          {
            name: "press.press-kit.item.description-logo",
            image: previewIcons.opis,
            file: "/tmp/press/Job Fair - Opće informacije.pdf",
          },
        ].map((x) => ({ ...x, file: encodeURI(x.file) })),
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

      > * {
        color: $fer-black;
      }
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
      flex: 1;
      justify-content: flex-end;
      margin-left: auto;
      cursor: pointer;
      transition-timing-function: $transition-bounce-function;
      transition-property: transform;
      color: $fer-dark-blue;
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
        color: #{color.adjust($fer-black, $alpha: -.2)};
        gap: .5rem;

        &:hover {
          color: $fer-black;

          .pressKitItemImage {
            transition-duration: 0s;
            border-color: #{color.adjust($fer-black, $alpha: -.6)};

            .pressItemImageElement {
              transition-duration: 0s;
              opacity: 1;
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
        transition-timing-function: $transition-bounce-function;
        transition-property: border-color;
        border: 1px solid #{color.adjust($fer-black, $alpha: -.8)};
        border-radius: 4px;

        .pressItemImageElement {
          width: 100%;
          height: 100%;
          transition-property: opacity;
          opacity: .6;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
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
      transition-timing-function: $transition-bounce-function;
      transition-property: transform;
    }

    .mediaRelease {
      display: flex;
      color: $fer-dark-blue;
      gap: 1rem;

      &:hover {

        .mediaReleaseIcon {
          transform: translateY(10%);
        }
      }

      &:active {

        .mediaReleaseIcon {
          transform: translateY(20%);
        }
      }
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

    .galleryContainer {
      display: grid;
      gap: .8rem;
      grid-template-columns: 1fr 1fr;

      .galleryItem {
        overflow: hidden;
        width: 100%;
        border-radius: 4px;
        aspect-ratio: 1.95;

        :global(.p-image) {
          width: 100%;
          height: 100%;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
</style>
