<template>
  <app-user-profile-container :class="$style.container">
    <h1>
      <translated-text
        trans-key="profile.about-company"
      />
    </h1>

    <client-only>
      <app-formgroup
        :class="$style.form"
        :errors="errors"
        :inputs="info"
        :loading="isLoading"
        @submit="handleUpdate"
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

          <div :class="$style.column2" class="text-right -mt-3">
            <p-button
              :loading="isLoading"
              class="p-button-secondary font-bold"
              type="submit"
            >
              <translated-text trans-key="form.save" />
            </p-button>
          </div>
        </template>
      </app-formgroup>
    </client-only>
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onBeforeMount,
    reactive,
    ref,
    unref,
    useCssModule,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    companyCreate,
  } from "~/helpers/forms/company";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageProfileCompanyHome",

    components: {
      TranslatedText,
      AppFormgroup,
      AppUserProfileContainer,
    },

    setup() {
      useTitle("profile.about-company");

      const $style = useCssModule();
      const toast = useToast();
      const userStore = useUserStore();
      const industriesStore = useIndustriesStore();
      const companyStore = useCompanyStore();

      const isLoading = ref(false);

      const industriesOptions = computed(() => industriesStore.industries.map((x) => ({ label: x, value: x })));
      const company = computed(() => userStore.user!.companies[0]);

      onBeforeMount(async () => {
        isLoading.value = true;
        await industriesStore.fetchIndustries();
        isLoading.value = false;
      });

      const info_ = companyCreate(unref(company))(industriesOptions);
      const info = reactive({
        ...info_,
        industry: {
          ...info_.industry,
          classes: [
            $style.column2,
          ],
        },
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
        company,
        info,
        errors,
        async handleUpdate() {
          resetErrors();
          const data = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          isLoading.value = true;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const resp = await companyStore.updateCompanyInfo({
            info: data,
          });
          isLoading.value = false;

          if (!resp) {
            errors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (!errorList) {
            toast.add({
              severity: "success",
              summary: "Success",
              closable: true,
              life: 3000,
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
  @use "sass:color";
  @import "assets/styles/include/index";

  .container {

    .form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: min(6.25rem, 7.5vw);

      @include media(lg) {
        grid-template-columns: 1fr;
      }

      .column2 {
        grid-column: 2;

        @include media(lg) {
          grid-column: initial;
        }
      }
    }
  }
</style>
