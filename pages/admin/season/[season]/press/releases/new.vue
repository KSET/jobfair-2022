<template>
  <app-max-width-container :class="$style.container">
    <h1>
      New press release
    </h1>

    <app-formgroup
      :class="$style.form"
      :errors="errors"
      :inputs="info"
      :loading="isLoading"
      @submit="handleSubmit"
    >
      <template #after>
        <div
          v-if="errors.entity.length > 0"
          :class="$style.errorContainer"
        >
          <translated-text
            v-for="err in errors.entity"
            :key="err.message"
            :trans-key="err.message"
          />
        </div>

        <div class="flex -mt-3">
          <nuxt-link :to="{ name: 'admin-season-season-press-releases' }">
            <p-button>Cancel</p-button>
          </nuxt-link>

          <p-button
            :loading="isLoading"
            class="p-button-secondary font-bold ml-auto"
            type="submit"
          >
            <translated-text trans-key="form.save" />
          </p-button>
        </div>
      </template>
    </app-formgroup>
  </app-max-width-container>
</template>
<script lang="ts">
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    defineComponent,
    reactive,
    useRouter,
    useRoute,
    ref,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    pressReleaseCreate,
  } from "~/helpers/forms/press-release";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useMutation,
  } from "~/composables/useQuery";
  import {
    CreatePressRelease,
    ICreatePressReleaseMutation,
    ICreatePressReleaseMutationVariables,
    IPressReleaseWithFilesCreateInput,
  } from "~/graphql/schema";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageAdminPressReleaseNew",

    components: {
      TranslatedText,
      AppFormgroup,
      AppMaxWidthContainer,
    },

    setup() {
      useTitle("New Press Release", false);

      const $router = useRouter();
      const route = useRoute();

      const info_ = pressReleaseCreate();
      const info = reactive({
        ...info_,
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const isLoading = ref(false);

      return {
        info,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const data: IPressReleaseWithFilesCreateInput = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);
          const resp = await useMutation<ICreatePressReleaseMutation, ICreatePressReleaseMutationVariables>(CreatePressRelease)({
            info: {
              ...data,
              season: route.params.season as string,
            },
          }).then((resp) => resp?.data?.createPressRelease);
          isLoading.value = false;

          if (!resp) {
            errors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (!errorList) {
            await $router.push({
              name: "admin-season-season-press-releases",
            });
            return;
          }

          for (const error of errorList) {
            errors[error.field as keyof typeof errors].push({
              message: error.message,
            });
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    .form {
      display: flex;
      flex-direction: column;
    }

    .errorContainer {
      font-weight: bold;
      display: flex;
      flex-direction: column;
      margin-top: -.75rem;
      margin-bottom: -1.5rem;
      text-align: center;
      color: $fer-error;
      grid-column: span 2;
      gap: .5rem;

      @include media(lg) {
        grid-column: initial;
      }
    }
  }
</style>
