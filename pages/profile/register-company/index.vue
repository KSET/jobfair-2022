<template>
  <app-user-profile-container :class="$style.container">
    <h1>
      <translated-text trans-key="register-company.header" />
    </h1>
    <div v-if="stage === Stage.CheckVat">
      <form
        :aria-disabled="isLoading"
        :class="$style.formContainer"
        method="POST"
        @submit.prevent="handleVatSubmit"
      >
        <app-input
          v-model="info.vat.value"
          :class="$style.formElement"
          :disabled="isLoading"
          :invalid="errors.vat.length > 0"
          label-key="form.vat"
          name="vat"
          placeholder="HR12345678901"
          required
          type="text"
        >
          <template v-if="errors.vat.length > 0" #message>
            <translated-text
              v-for="err in errors.vat"
              :key="err.message"
              :trans-key="err.message"
              class="block"
            />
          </template>
        </app-input>

        <div class="text-center -mt-3">
          <p-button
            :loading="isLoading"
            class="p-button-secondary font-bold"
            type="submit"
          >
            <translated-text trans-key="form.submit" />
          </p-button>
        </div>
      </form>
    </div>
    <div v-else-if="stage === Stage.EnterInfo">
      <app-formgroup
        :class="$style.companyForm"
        :errors="errors"
        :inputs="info"
        :loading="isLoading"
        @submit="handleCompanySubmit"
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
              <translated-text trans-key="form.submit" />
            </p-button>
          </div>
        </template>
      </app-formgroup>
    </div>
  </app-user-profile-container>
</template>

<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument */
  import {
    computed,
    defineComponent,
    nextTick,
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
    useRouter,
  } from "vue-router";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppInput from "~/components/util/form/app-input.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import useTitle from "~/composables/useTitle";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    companyCreate,
  } from "~/helpers/forms/company";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";

  enum Stage {
    CheckVat,
    EnterInfo,
  }

  export default defineComponent({
    name: "PageProfileRegisterCompany",

    components: {
      AppFormgroup,
      AppInput,
      TranslatedText,
      AppUserProfileContainer,
    },

    setup() {
      useTitle("register-company.header");

      const $style = useCssModule();
      const router = useRouter();
      const industriesStore = useIndustriesStore();
      const companyStore = useCompanyStore();

      const stage = ref(Stage.CheckVat);
      const isLoading = ref(false);

      const industriesOptions = computed(() => industriesStore.industries.map((x) => ({ label: x, value: x })));

      const info_ = companyCreate()(industriesOptions);
      const info = reactive({
        ...info_,
        industry: {
          ...info_.industry,
          classes: [
            $style.column2,
          ],
        },
      });
      const resetInfo = () => keys(info).forEach((key) => (info[key] as { value: string, }).value = "");

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      return {
        Stage,
        stage,
        info,
        errors,
        isLoading,
        industriesOptions,
        async handleVatSubmit() {
          resetErrors();
          isLoading.value = true;
          try {
            const vat = info.vat.value;
            const resp = await companyStore.validateVat(vat);

            if (!resp || !resp.valid) {
              errors.vat.push({
                message: "errors.vat.invalid",
              });

              return;
            }

            if (resp.exists) {
              errors.vat.push({
                message: "errors.vat.already-exists",
              });

              return;
            }

            resetInfo();
            info.vat.value = vat;
            if (resp.info) {
              info.address.value = resp.info.address;
              info.legalName.value = resp.info.legalName;
            }
            await industriesStore.fetchIndustries();
            info.industry.value = unref(industriesOptions)[0]?.label || "";
          } finally {
            isLoading.value = false;
          }

          stage.value = Stage.EnterInfo;
        },
        async handleCompanySubmit() {
          resetErrors();
          isLoading.value = true;
          try {
            const data = pipe(
              (x: typeof info) => keys(x),
              map((key) => [ key, (info[key] as { value: unknown, }).value ]),
              Object.fromEntries,
            )(info);

            const resp = await companyStore.registerCompany({
              info: data,
            });

            if (!resp) {
              errors.entity.push({
                message: "errors.somethingWentWrong",
              });
              return;
            }

            const errorList = resp.errors;

            if (!errorList) {
              await router.push({ name: "profile-me" });
              await nextTick();
              window.location.reload();

              return;
            }

            for (const error of errorList) {
              errors[error.field as keyof typeof errors].push({
                message: error.message,
              });
            }
          } finally {
            isLoading.value = false;
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "../../../assets/styles/include/index";

  .container {
    --gap-row: 2.5rem;

    @include media(lg) {
      --gap-row: 1.875rem;
    }

    .formContainer {
      display: flex;
      flex-direction: column;
      max-width: 450px;
      margin: 0 auto;
      gap: var(--gap-row);

      .formElement {
        width: 100%;
      }
    }

    .companyForm {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: min(6.25rem, 7.5vw);
      grid-row-gap: var(--gap-row);

      @include media(lg) {
        grid-template-columns: 1fr;
      }

      .column2 {
        grid-column: 2;

        @include media(lg) {
          grid-column: initial;
        }
      }

      .columnSpan2 {
        grid-column: span 2;

        @include media(lg) {
          grid-column: initial;
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
  }
</style>
