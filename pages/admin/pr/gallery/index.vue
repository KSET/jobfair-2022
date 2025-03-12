<template>
  <app-max-width-container :class="$style.container">
    <h1>Uredi Galeriju</h1>
    <div>
      <nuxt-link :to="{ name: 'admin' }">
        &larr; Back
      </nuxt-link>
    </div>
    <div>
      <AppTransitionFadeSmooth group :class="$style.galleryImages">
        <edit-gallery-image
          key="new"
          :class="$style.galleryImageForm"
          :loading="isLoading"
          @delete="handleUpdateGalleryImages"
          @save="handleUpdateGalleryImages"
        />

        <edit-gallery-image
          v-for="galleryImage in galleryImages"
          :key="galleryImage.uid"
          :class="$style.galleryImageForm"
          :is-first="galleryImage === galleryImages[0]"
          :is-last="galleryImage === galleryImages[galleryImages.length - 1]"
          :loading="isLoading"
          :gallery-image="galleryImage"
          @delete="handleUpdateGalleryImages"
          @move="handleMoveGalleryImage(galleryImage, $event)"
          @save="handleUpdateGalleryImages"
          @edit="handleUpdateGalleryImages"
        />
      </AppTransitionFadeSmooth>
    </div>

    <div class="mt-5">
      <nuxt-link :to="{ name: 'admin', hash: '#asdf' }">
        &larr; Back
      </nuxt-link>
    </div>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed, defineComponent, ref, unref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import {
    type MaybeRef,
  } from "~/helpers/type";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useQuery, useMutation,
  } from "~/composables/useQuery";
  import {
    AllGalleryImages,
    type IAllGalleryImagesQuery,
    type IAllGalleryImagesQueryVariables,
    type IGalleryImage,
    type IMutationSwapGalleryImageOrderArgs,
  } from "~/graphql/schema";
  import EditGalleryImage from "~/components/page/admin/gallery/edit-gallery-image.vue";
  import AppTransitionFadeSmooth from "~/components/util/app-transition-fade-smooth.vue";

  export default defineComponent({
    name: "PageAdminSeasonHome",

    components: {
      AppTransitionFadeSmooth,
      EditGalleryImage,
      AppMaxWidthContainer,
    },

    async setup() {
      const isLoading = ref(false);

      const GalleryImageQuery = useQuery<
        IAllGalleryImagesQuery,
        IAllGalleryImagesQueryVariables
      >({
        query: AllGalleryImages,
      });

      const resp = await GalleryImageQuery().then((resp) => resp?.data || null);

      const galleryImages = ref(resp?.allGalleryImages || []);

      const refreshGalleryImages = async () => {
        const resp = await GalleryImageQuery().then((resp) => resp?.data || null);
        galleryImages.value = resp?.allGalleryImages || [];
      };

      const ordered = <T extends { order: number, }>(xs: MaybeRef<T[]>) =>
        [ ...unref(xs) ].sort((a, b) => a.order - b.order);
      return {
        galleryImages: computed(() => ordered(galleryImages)),
        isLoading,
        async handleUpdateGalleryImages() {
          await refreshGalleryImages();
        },
        async handleMoveGalleryImage(
          galleryImage: IGalleryImage,
          direction: string,
        ) {
          const offset = "left" === direction ? -1 : 1;
          const newOrder = galleryImage.order + offset;
          const toSwapWith = galleryImages.value.find(
            (s) => s.order === newOrder,
          );

          if (!toSwapWith) {
            return;
          }

          isLoading.value = true;
          await useMutation<boolean, IMutationSwapGalleryImageOrderArgs>(
            gql`
            mutation SwapGalleryImageOrder($orderA: Int!, $orderB: Int!) {
              swapGalleryImageOrder(orderA: $orderA, orderB: $orderB)
            }
          `,
          )({
            orderA: galleryImage.order,
            orderB: newOrder,
          });
          await refreshGalleryImages();
          isLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
@import "assets/styles/include";

.container {
  > div > a {
    color: $fer-dark-blue;

    &:hover {
      text-decoration: underline;
    }
  }

  .galleryImages {
    position: relative;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    @include media(sm) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .galleryImageForm {
      font-size: 0.8rem;
    }
  }
}
</style>
