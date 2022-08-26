<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="forgot-password.header" />
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
        :disabled="isLoading"
        label-key="form.email"
        name="identifier"
        placeholder="user@example.com"
        required
        type="email"
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
      </div>
    </form>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    mapObject,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    defineComponent,
    onBeforeMount,
    reactive,
    ref,
    useRouter,
  } from "#imports";

  export default defineComponent({
    name: "PageForgotPassword",

    components: {
      AppInput,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("forgot-password.header");
      const router = useRouter();
      const userStore = useUserStore();
      const toast = useToast();

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

        await router.push({ name: "profile-me-settings" });
      });

      return {
        info,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const success = await userStore.requestResetPassword({
            identifier: info.username,
          });
          isLoading.value = false;

          if (!success) {
            errors.user.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          toast.add({
            severity: "success",
            summary: "Sent code. Check your email!",
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "../../assets/styles/include/index";

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
