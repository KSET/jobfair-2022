<template>
  <app-max-width-container :class="$style.container">
    <h1>
      New press release
    </h1>

    <client-only>
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
            <a :href="$router.resolve({ name: 'admin' }).href">
              <p-button>Cancel</p-button>
            </a>

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
    </client-only>
    <pre v-text="info" />
  </app-max-width-container>
</template>
<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    useRoute,
    useRouter,
  } from "vue-router";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    pressReleaseCreate,
  } from "~/helpers/forms/press-release";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    IPressReleaseQuery,
    IPressReleaseQueryVariables,
    IPressReleaseWithFilesCreateInput,
    IUpdatePressReleaseMutation,
    IUpdatePressReleaseMutationVariables,
    PressRelease,
    UpdatePressRelease,
  } from "~/graphql/schema";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageAdminPressReleaseNew",

    components: {
      TranslatedText,
      AppFormgroup,
      AppMaxWidthContainer,
    },

    async setup() {
      useTitle("Edit Press Release", false);

      const $router = useRouter();
      const $route = useRoute();

      const uid = $route.params.uid as string;

      const pressRelease = await useQuery<IPressReleaseQuery, IPressReleaseQueryVariables>({
        query: PressRelease,
        variables: {
          uid,
        },
      })();

      const info_ = pressReleaseCreate(pressRelease?.data?.pressRelease);
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

          if ("string" === typeof data.file) {
            delete data.file;
          }

          const resp = await useMutation<IUpdatePressReleaseMutation, IUpdatePressReleaseMutationVariables>(UpdatePressRelease)({
            uid,
            info: data,
          }).then((resp) => resp?.data?.updatePressRelease);
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
              name: "admin",
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
