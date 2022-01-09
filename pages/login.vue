<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="login.header" />
    </h1>

    <form :class="$style.formContainer" method="POST">
      <app-input
        v-model="info.username"
        :class="$style.formElement"
        label-key="form.email"
        name="username"
        placeholder="user@example.com"
        required
        type="text"
      />

      <app-input
        v-model="info.password"
        :class="$style.formElement"
        label-key="form.password"
        :minlength="8"
        name="password"
        placeholder="••••••••"
        required
        type="password"
      />

      <div :class="$style.registerContainer">
        <p-button
          class="p-button-secondary w-full font-bold"
          type="submit"
        >
          <translated-text trans-key="form.submit" />
        </p-button>
        <div :class="$style.registerText">
          <translated-text trans-key="login.no-account" />
          <nuxt-link :to="{ name: 'register' }">
            <translated-text trans-key="login.register" />
          </nuxt-link>
        </div>
      </div>
    </form>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
  } from "vue";
  import AppMaxWidthContainer from "../components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import AppInput from "~/components/util/form/app-input.vue";

  export default defineComponent({
    name: "PageLogin",

    components: {
      AppInput,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("login.header");

      const info = reactive({
        username: "",
        password: "",
      });

      return {
        info,
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .formContainer {
    display: flex;
    flex-direction: column;
    max-width: 450px;
    margin: 0 auto;
    gap: 2.5rem;

    @include media(md) {
      gap: 1.875rem;
    }

    .formElement {
      width: 100%;
    }
  }

  .registerContainer {
    margin-top: 1.5rem;

    @include media(md) {
      margin-top: .625rem;
    }

    .registerText {
      font-weight: bold;
      display: flex;
      justify-content: center;
      margin-top: 1rem;
      gap: .5rem;

      @include media(md) {
        margin-top: 1.875rem;
      }
    }
  }
</style>
