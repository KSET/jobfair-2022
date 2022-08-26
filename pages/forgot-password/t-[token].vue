<template>
  <app-max-width-container :class="$style.container">
    <h1>
      <translated-text trans-key="forgot-password.header" />
    </h1>

    <form
      v-if="isTokenValid"
      :aria-disabled="isLoading"
      :class="$style.formContainer"
      method="POST"
      @submit.prevent="handleSubmit"
    >
      <app-input
        v-model="info.newPassword"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.newPassword.length > 0"
        label-key="form.newPassword"
        name="newPassword"
        placeholder="••••••••"
        required
        type="password"
      >
        <template v-if="errors.newPassword.length > 0" #message>
          <translated-text
            v-for="err in errors.newPassword"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>
      <app-input
        v-model="info.newPasswordRepeat"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.newPasswordRepeat.length > 0"
        label-key="form.newPasswordRepeat"
        name="newPasswordRepeat"
        placeholder="••••••••"
        required
        type="password"
      >
        <template v-if="errors.newPasswordRepeat.length > 0" #message>
          <translated-text
            v-for="err in errors.newPasswordRepeat"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

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
    <h3 v-else :class="$style.errorHeader">
      <translated-text trans-key="forgot-password.token-invalid" />
    </h3>
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
  import {
    defineComponent,
    reactive,
    ref,
    useMutation,
    useRoute,
    useRouter,
  } from "#imports";
  import useTitle from "~/composables/useTitle";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    CheckPasswordReset,
    ICheckPasswordResetMutation,
    ICheckPasswordResetMutationVariables,
    IUsePasswordResetMutation,
    IUsePasswordResetMutationVariables,
    UsePasswordReset,
  } from "~/graphql/schema";

  export default defineComponent({
    components: {
      AppInput,
      TranslatedText,
      AppMaxWidthContainer,
    },

    async setup() {
      useTitle("forgot-password.header");

      const router = useRouter();
      const route = useRoute();
      const toast = useToast();

      const isLoading = ref(false);
      const isTokenValid = ref(true);
      const token = String(route.params.token);

      const info = reactive({
        newPassword: "",
        newPasswordRepeat: "",
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        user: "",
      }));
      const resetErrors = () => Object.keys(errors).forEach((key) => errors[key] = []);

      const resp = await useMutation<ICheckPasswordResetMutation, ICheckPasswordResetMutationVariables>(CheckPasswordReset)({
        token,
      });

      isTokenValid.value = Boolean(resp?.data?.checkPasswordReset) || true;

      return {
        isLoading,
        isTokenValid,
        info,
        errors,
        async handleSubmit() {
          resetErrors();

          isLoading.value = true;
          const resp = await useMutation<IUsePasswordResetMutation, IUsePasswordResetMutationVariables>(UsePasswordReset)({
            info: {
              token,
              ...info,
            },
          }).then((resp) => resp?.data?.usePasswordReset);
          isLoading.value = false;

          if (!resp) {
            errors.user.push({
              message: "Something went wrong. Please try again.",
            });

            return;
          }

          const errorList = resp.errors || [];
          if (0 < errorList.length) {
            errorList.forEach((err) => {
              errors[err.field]?.push({
                message: err.message,
              });
            });

            return;
          }

          if (!resp.entity) {
            errors.user.push({
              message: "Something went wrong. Please try again.",
            });
          }

          toast.add({
            severity: "success",
            summary: "Password updated!",
            life: 3000,
          });

          await router.push({ name: "login" });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .formContainer {
    display: flex;
    flex-direction: column;
    max-width: 450px;
    margin: 0 auto;
    gap: 2.5rem;
  }

  .errorHeader {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    color: $fer-error;
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
  }
</style>
