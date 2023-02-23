<template>
  <app-max-width-container>
    <h1>PR</h1>

    <div :class="$style.formContainer">
      <form :class="$style.form" @submit="submitHandler">
        <app-input
          v-model="urlInput"
          required
          label="URL"
          name="url"
          type="url"
          :disabled="isLoading"
        />
        <p-button :class="$style.submitButton" :loading="isLoading" type="submit">
          Generiraj QR kod
        </p-button>
      </form>
      <img
        v-if="svgUrl"
        :class="$style.qrCode"
        :src="svgUrl"
      >
    </div>
  </app-max-width-container>
</template>

  <script lang="ts">
  import {
    defineComponent,
    ref,
    useRuntimeConfig,
  } from "#imports";

  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppInput from "~/components/util/form/app-input.vue";

  export default defineComponent({
    name: "PageAdminTranslationsHome",

    components: {
      AppMaxWidthContainer,
      AppInput,
    },

    setup() {
      const config = useRuntimeConfig();
      const urlInput = ref("");
      const svgUrl = ref("");

      const isLoading = ref(false);

      return {
        urlInput,
        config,
        async submitHandler(e: Event) {
          e.preventDefault();

          isLoading.value = true;
          try {
            URL.revokeObjectURL(svgUrl.value);
          } catch {}
          svgUrl.value = "";

          // Dobavi sliku
          const svgBlob = await fetch(
            `${ config.public.API_BASE }/i/qr/link/`,
            {
              method: "POST",
              body: JSON.stringify({
                url: urlInput.value,
              }),
              credentials: "include",
              headers: {
                "content-type": "application/json",
              },
              mode: "cors",
            },
          )
            .then((res) => res.blob())
            .catch(() => null)
          ;
          isLoading.value = false;

          if (null === svgBlob) {
            return alert("Pogreška pri generiranju QR koda, pokušajte ponovno. :-)");
          }

          svgUrl.value = URL.createObjectURL(svgBlob);
        },
        isLoading,
        svgUrl,
      };
    },
  });
  </script>

  <style lang="scss" module>
      .formContainer {
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        gap: 2.5em;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: .5em;

        .submitButton {
          margin-left: auto;
        }
      }

      .qrCode {
        max-width: 35em;
        align-self: center;
      }
  </style>
