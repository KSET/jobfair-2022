<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="register.header" />
    </h1>

    <form
      :aria-disabled="isLoading || null"
      :class="$style.formContainer"
      method="POST"
      @submit.prevent="handleSubmit"
    >
      <app-input
        v-model="info.email"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.email.length > 0"
        label-key="form.email"
        name="email"
        placeholder="jobfair@kset.org"
        required
        type="email"
      >
        <template v-if="errors.email.length > 0" #message>
          <translated-text
            v-for="err in errors.email"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="info.firstName"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.firstName.length > 0"
        label-key="form.firstName"
        name="firstName"
        placeholder="Marko"
        required
        type="text"
      >
        <template v-if="errors.firstName.length > 0" #message>
          <translated-text
            v-for="err in errors.firstName"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="info.lastName"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.lastName.length > 0"
        label-key="form.lastName"
        name="lastName"
        placeholder="Horvat"
        required
        type="text"
      >
        <template v-if="errors.lastName.length > 0" #message>
          <translated-text
            v-for="err in errors.lastName"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="info.phone"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.phone.length > 0"
        label-key="form.phone"
        name="phone"
        placeholder="+385981234567"
        required
        type="phone"
      >
        <template v-if="errors.phone.length > 0" #message>
          <translated-text
            v-for="err in errors.phone"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="info.password"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.password.length > 0"
        :minlength="8"
        label-key="form.password"
        name="password"
        placeholder="••••••••"
        required
        type="password"
      >
        <template v-if="errors.password.length > 0" #message>
          <translated-text
            v-for="err in errors.password"
            :key="err.message"
            :trans-key="err.message"
            class="block"
          />
        </template>
      </app-input>

      <app-input
        v-model="info.passwordRepeat"
        :class="$style.formElement"
        :disabled="isLoading"
        :invalid="errors.passwordRepeat.length > 0"
        :minlength="8"
        label-key="form.passwordRepeat"
        name="passwordRepeat"
        placeholder="••••••••"
        required
        type="password"
      >
        <template v-if="errors.passwordRepeat.length > 0" #message>
          <translated-text
            v-for="err in errors.passwordRepeat"
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
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    nextTick,
    reactive,
    ref,
  } from "vue";
  import {
    mapObject,
  } from "rambdax";
  import {
    useRouter,
  } from "vue-router";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    useUserStore,
  } from "~/store/user";

  export default defineComponent({
    name: "PageRegister",

    components: {
      AppInput,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("register.header");

      const router = useRouter();
      const userStore = useUserStore();

      const info = reactive({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
        passwordRepeat: "",
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        user: "",
      }));
      const resetErrors = () => Object.keys(errors).forEach((key) => errors[key] = []);

      const isLoading = ref(false);

      return {
        info,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const resp = await userStore.register({
            info,
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
            await router.push("/");

            await nextTick();
            window.location.reload();

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

