<template>
  <app-max-width-container>
    <h1>
      <translated-text trans-key="register.header" />
    </h1>

    <app-formgroup
      :class="$style.formContainer"
      :errors="errors"
      :inputs="info"
      :loading="isLoading"
      @submit="handleSubmit"
    >
      <template #after>
        <div class="mt-3 flex">
          <label class="flex align-items-center">
            <input
              v-model="gdprCheckbox"
              required
              type="checkbox"
            >

            <span class="ml-2">
              <translated-text trans-key="form.register.gdpr" />
            </span>
          </label>
        </div>

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
            :disabled="!gdprCheckbox"
            :loading="isLoading"
            class="p-button-secondary w-full font-bold"
            type="submit"
          >
            <translated-text trans-key="form.submit" />
          </p-button>
        </div>
      </template>
    </app-formgroup>
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
    keys,
    mapObject,
  } from "rambdax";
  import {
    useRouter,
  } from "vue-router";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import useTitle from "~/composables/useTitle";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    decodeRedirectParam,
  } from "~/helpers/url";
  import {
    onBeforeMount,
    useRoute,
  } from "#imports";
  import {
    userRegister,
  } from "~/helpers/forms/user";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    type IUserRegisterInput,
  } from "~/graphql/schema";
  import {
    type Dict,
  } from "~/helpers/type";

  export default defineComponent({
    name: "PageRegister",

    components: {
      AppFormgroup,
      TranslatedText,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("register.header");

      const route = useRoute();
      const router = useRouter();
      const userStore = useUserStore();

      const info = reactive(userRegister()());

      type AuthError = {
        message: string,
      };
      const _e = <T extends Dict>(x: T) => reactive(mapObject(() => [] as AuthError[], x)) as Record<keyof T, AuthError[]>;
      const errors = _e({
        ...info,
        user: "",
      });
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);
      type ErrorList = { field: keyof typeof errors, message: string, }[] | undefined;

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

      const isLoading = ref(false);
      const gdprCheckbox = ref(true);

      return {
        info,
        errors,
        isLoading,
        gdprCheckbox,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const resp = await userStore.register({
            info: mapObject((x) => (x as Dict).value, info) as IUserRegisterInput,
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
            const redirectInfo = route.query?.r;
            if (redirectInfo && "string" === typeof redirectInfo) {
              await router.push(decodeRedirectParam(redirectInfo) || "/");
            } else {
              await router.push("/");
            }

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

