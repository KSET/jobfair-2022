<template>
  <app-user-profile-container>
    <h1>
      <translated-text trans-key="profile.settings" />
    </h1>

    <app-formgroup
      :class="$style.formContainer"
      :errors="errors"
      :inputs="info"
      :loading="isLoading"
      @submit="handleSubmit"
    >
      <template #after>
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
            <translated-text trans-key="form.save" />
          </p-button>
        </div>
      </template>
    </app-formgroup>

    <form
      :aria-disabled="isLoading || null"
      :class="$style.formContainer"
      class="mt-6"
      method="POST"
      @submit.prevent="handlePasswordSubmit"
    >
      <app-input
        v-model="pass.currentPassword"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.currentPassword.length > 0"
        :minlength="8"
        label-key="form.currentPassword"
        name="currentPassword"
        placeholder="••••••••"
        required
        type="password"
      >
        <template v-if="errors.currentPassword.length > 0" #message>
          <translated-text
            v-for="err in errors.currentPassword"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="pass.newPassword"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.newPassword.length > 0"
        :minlength="8"
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
        v-model="pass.newPasswordRepeat"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.newPasswordRepeat.length > 0"
        :minlength="8"
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
        v-if="errors.password.length > 0"
        :class="$style.errorContainer"
      >
        <translated-text
          v-for="err in errors.password"
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
          <translated-text trans-key="form.save" />
        </p-button>
      </div>
    </form>
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    keys,
    mapObject,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    userProfileEdit,
  } from "~/helpers/forms/user";
  import {
    IUserCreateInput,
  } from "~/graphql/schema";
  import {
    Dict,
  } from "~/helpers/type";

  export default defineComponent({
    name: "PageRegister",

    components: {
      AppFormgroup,
      AppUserProfileContainer,
      AppInput,
      TranslatedText,
    },

    setup() {
      useTitle("profile.settings");

      const userStore = useUserStore();
      const toast = useToast();

      const user = userStore.user!;

      const info = reactive(userProfileEdit(user));

      const pass = reactive({
        currentPassword: "",
        newPassword: "",
        newPasswordRepeat: "",
      });

      type AuthError = {
        message: string,
      };
      const _e = <T extends Dict>(x: T) => reactive(mapObject(() => [] as AuthError[], x)) as Record<keyof T, AuthError[]>;
      const errors = _e({
        ...info,
        ...pass,
        user: "",
        password: "",
      });
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);
      type ErrorList = { field: keyof typeof errors, message: string, }[] | undefined;

      const isLoading = ref(false);

      return {
        info,
        pass,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const resp = await userStore.updateProfile({
            info: {
              ...mapObject((x) => (x as { value: unknown, }).value, info),
              password: "",
            } as IUserCreateInput,
          });
          isLoading.value = false;

          if (!resp) {
            errors.user.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors as ErrorList;

          if (!errorList) {
            toast.add({
              severity: "success",
              summary: "Saved",
              life: 3000,
            });

            return;
          }

          for (const error of errorList) {
            errors[error.field].push({
              message: error.message,
            });
          }
        },
        async handlePasswordSubmit() {
          resetErrors();
          isLoading.value = true;
          const resp = await userStore.updatePassword(pass);
          isLoading.value = false;

          if (!resp) {
            errors.user.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors as ErrorList;

          if (!errorList) {
            toast.add({
              severity: "success",
              summary: "Saved",
              life: 3000,
            });

            keys(pass).forEach((key) => {
              pass[key] = "";
            });

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
</style>
