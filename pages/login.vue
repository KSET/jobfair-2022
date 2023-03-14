<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="login.header" />
    </h1>

    <form
      :aria-disabled="isLoading"
      :class="$style.formContainer"
      method="POST"
      @submit.prevent="handleSubmit"
    >
      <app-input
        v-model="info.username"
        :class="$style.formElement"
        label-key="form.email"
        name="identifier"
        placeholder="user@example.com"
        required
        type="email"
      />

      <app-input
        v-model="info.password"
        :class="$style.formElement"
        :minlength="8"
        label-key="form.password"
        name="password"
        placeholder="••••••••"
        required
        type="password"
      />

      <div
        v-if="errors.user.length > 0"
        :class="$style.errorContainer"
      >
        <translated-text
          v-for="err in errors.user"
          :key="err.message"
          :trans-key="err.message"
        />
      </div>

      <div :class="$style.submitContainer">
        <p-button
          :loading="isLoading"
          class="p-button-secondary w-full font-bold"
          type="submit"
        >
          <translated-text trans-key="form.submit" />
        </p-button>
        <div :class="$style.registerText">
          <translated-text trans-key="login.no-account" />
          <nuxt-link :to="{ name: 'register', query: { r: redirectInfo, }, }">
            <translated-text trans-key="login.register" />
          </nuxt-link>
        </div>
        <div :class="$style.registerText">
          <translated-text trans-key="login.forgot-password" />
          <nuxt-link :to="{ name: 'forgot-password', }">
            <translated-text trans-key="login.forgot-password.text" />
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
    ref,
  } from "vue";
  import {
    mapObject,
  } from "rambdax";
  import {
    useRouter,
    useRoute,
  } from "vue-router";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    decodeRedirectParam,
  } from "~/helpers/url";
  import {
    computed,
    onBeforeMount,
  } from "#imports";

  export default defineComponent({
    name: "PageLogin",

    components: {
      AppInput,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("login.header");
      const router = useRouter();
      const route = useRoute();
      const userStore = useUserStore();

      const isLoading = ref(false);

      const info = reactive({
        username: "",
        password: "",
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        user: "",
      }));
      const resetErrors = () => Object.keys(errors).forEach((key) => errors[key] = []);

      onBeforeMount(async () => {
        if (!userStore.isLoggedIn) {
          return;
        }

        const redirectInfo = (() => {
          const queryRedirect = route.query?.r;

          if (!queryRedirect || !("string" === typeof queryRedirect)) {
            return null;
          }

          return decodeRedirectParam(queryRedirect);
        })();

        await router.push(redirectInfo || { name: "profile-me" });
      });

      return {
        info,
        errors,
        isLoading,
        redirectInfo: computed(() => route.query?.r),
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const resp = await userStore.login({
            identifier: info.username,
            password: info.password,
          });
          isLoading.value = false;

          if (!resp) {
            errors.user.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (!errorList) {
            const redirectInfo = route.query?.r;
            if (redirectInfo && "string" === typeof redirectInfo) {
              await router.push(decodeRedirectParam(redirectInfo) || "/");
            } else {
              await router.push("/");
            }

            return;
          }

          for (const error of errorList) {
            errors[error.field].push({
              message: error.message,
            });
          }
        },
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

  .errorContainer {
    font-weight: bold;
    display: flex;
    flex-direction: column;
    margin-top: -.75rem;
    margin-bottom: -1.5rem;
    text-align: center;
    color: $fer-error;
    gap: .5rem;
  }

  .submitContainer {
    margin-top: 1.5rem;
    margin-bottom: 4rem;

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
