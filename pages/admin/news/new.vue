<template>
  <AppMaxWidthContainer :class="$style.container">
    <h1>Dodaj novost</h1>

    <AppFormgroup
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
          <NuxtLink :to="{ name: 'admin-news' }">
            <PButton>
              <translated-text trans-key="form.cancel" />
            </PButton>
          </NuxtLink>

          <PButton
            :loading="isLoading"
            class="p-button-secondary font-bold ml-auto"
            type="submit"
          >
            <translated-text trans-key="form.save" />
          </PButton>
        </div>
      </template>
    </AppFormgroup>
  </AppMaxWidthContainer>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import Button from "primevue/button";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import useTitle from "~/composables/useTitle";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    ref,
    useMutation,
    useRouter,
  } from "#imports";
  import {
    newsEdit,
  } from "~/helpers/forms/news";
  import {
    CreateNews,
    ICreateNewsMutation,
    ICreateNewsMutationVariables,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminNewsNew",

    components: {
      AppFormgroup,
      AppMaxWidthContainer,
      PButton: Button,
    },

    setup() {
      useTitle("Admin | Dodaj novost");

      const isLoading = ref(false);
      const $router = useRouter();

      const info_ = newsEdit(null);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      info_.date.classes = "span-1";
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      info_.lang.classes = "span-1";
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

      return {
        isLoading,
        info,
        errors,
        async handleSubmit() {
          resetErrors();

          isLoading.value = true;

          const data: ICreateNewsMutationVariables["info"] = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          const resp = await useMutation<ICreateNewsMutation, ICreateNewsMutationVariables>(CreateNews)({
            info: data,
          }).then((resp) => resp?.data?.createNews);

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
              name: "admin-news",
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
  @import "assets/styles/page/news";

  .container {

    .form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      > * {
        grid-column: span 2;
      }

      > :global(.span-1) {
        grid-column: span 1;
      }

      :global(.ProseMirror) {

        > :first-child {
          margin-top: 0;
        }

        > :last-child {
          margin-bottom: 0;
        }

        @extend %news-styles;

        a {
          position: relative;

          &:hover,
          &:focus-within,
          &:focus {

            &::before {
              line-height: .45em;
              display: initial;
              padding: .5em;
            }
          }

          &::before {
            position: absolute;
            z-index: 3;
            top: 0;
            left: 1em;
            display: none;
            content: attr(href);
            transform: translateY(-100%);
            white-space: nowrap;
            color: $fer-white;
            border-radius: 4px;
            background-color: $fer-dark-blue;
          }

          &::after {
            font-family: primeicons, sans-serif;
            font-weight: 400;
            font-style: normal;
            font-variant: normal;
            line-height: 1;
            position: relative;
            right: 0;
            bottom: -.3em;
            display: inline-block;
            padding: .1em;
            content: "";
            text-transform: none;
            color: $fer-dark-blue;
            border-radius: 100% 80%;
            speak: none;
            backface-visibility: hidden;
          }
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
      grid-column: span 2;
      gap: .5rem;

      @include media(lg) {
        grid-column: initial;
      }
    }
  }
</style>
