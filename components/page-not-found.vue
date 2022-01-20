<template>
  <div :class="$style.pageContainer">
    <div class="grid">
      <div class="col-12" :class="$style.textContainer">
        <img
          :class="$style.image"
          :alt="notFoundText"
          src="@/assets/images/page/error/404.png"
        >
        <h1 :class="$style.headline">
          <translated-text trans-key="page.error.notFound.title" />
        </h1>
        <p :class="$style.text">
          <translated-text trans-key="page.error.notFound.text" />
        </p>
        <nuxt-link
          :to="{ name: 'index' }"
        >
          <p-button
            :class="$style.button"
            color="primary"
            x-large
          >
            <translated-text trans-key="page.error.notFound.startPage" />
          </p-button>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import Button from "primevue/button";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    components: {
      TranslatedText,
      PButton: Button,
    },

    setup() {
      const translationsStore = useTranslationsStore();

      const notFoundText = computed(() => `404 - ${ translationsStore.translation("page.error.notFound.title") }`);

      useTitle(notFoundText);

      return {
        notFoundText,
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .pageContainer {
    max-width: 680px;
    margin: 4em auto;
  }

  .image {
    width: 100%;
  }

  .textContainer {
    text-align: center;
  }

  .headline {
    font-size: 287.5%;
    font-weight: 700;
    line-height: 1.1em;
    margin: .7em 0;
    text-transform: uppercase;
    color: $fer-dark-blue;
  }

  .text {
    font-size: 125%;
  }

  .button {
    color: $fer-black !important;
  }
</style>
