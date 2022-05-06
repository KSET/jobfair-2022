<template>
  <app-max-width-container :not-found="!userExists" :class="$style.container">
    <h1>Edit user</h1>

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
            <a :href="$router.resolve({ name: 'admin-users' }).href">
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
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import {
    useRoute,
    useRouter,
  } from "vue-router";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    IRole,
    IUpdateUserMutation,
    IUpdateUserMutationVariables,
    IUser,
    UpdateUser,
  } from "~/graphql/schema";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    userEdit,
  } from "~/helpers/forms/user";

  export default defineComponent({
    name: "PageAdminUserEdit",

    components: {
      AppFormgroup,
      TranslatedText,
      AppMaxWidthContainer,
    },

    async setup() {
      const $route = useRoute();
      const $router = useRouter();

      const uid = $route.params.uid as string;

      type QueryData = {
        user: IUser | null,
        roles: IRole[],
      };
      type QueryArgs = {
        uid: string,
      };
      const resp = await useQuery<QueryData, QueryArgs>({
        query: gql`
            query User($uid: String!) {
                user(uid: $uid) {
                    uid
                    name
                    firstName
                    lastName
                    email
                    phone
                    roles {
                      name
                    }
                }

                roles {
                    name
                }
            }
        `,
        variables: {
          uid,
        },
      })();

      const isLoading = ref(false);

      const info_ = userEdit(resp?.data?.user)(resp?.data?.roles || []);
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
        userExists: Boolean(resp?.data?.user),
        info,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const data: IUpdateUserMutationVariables["info"] = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          const resp = await useMutation<IUpdateUserMutation, IUpdateUserMutationVariables>(UpdateUser)({
            uid,
            info: {
              ...data,
            },
          }).then((resp) => resp?.data?.updateUser);
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
