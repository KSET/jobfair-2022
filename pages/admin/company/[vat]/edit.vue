<template>
  <app-max-width-container v-if="company" :class="$style.container">
    <h1>
      Uredi firmu
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

          <div :class="$style.column2" class="flex -mt-3">
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
  </app-max-width-container>
  <page-not-found v-else />
</template>

<script lang="ts">
  import {
    computed,
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
  import {
    gql,
  } from "@urql/core";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    companyCreate,
  } from "~/helpers/forms/company";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    ICompany,
    IIndustry,
  } from "~/graphql/schema";
  import PageNotFound from "~/components/page-not-found.vue";

  export default defineComponent({
    name: "PageAdminCompanyEdit",

    components: {
      PageNotFound,
      TranslatedText,
      AppFormgroup,
      AppMaxWidthContainer,
    },

    async setup() {
      const $router = useRouter();
      const route = useRoute();
      const companyStore = useCompanyStore();
      const industriesStore = useIndustriesStore();

      const industriesOptions = computed(() => industriesStore.industries.map((x) => ({ label: x, value: x })));

      const isLoading = ref(false);

      type QCompany = ICompany;
      type QIndustry = Pick<IIndustry, "name">;
      type QueryData = {
        industries: Pick<IIndustry, "name">[],
        company: QCompany & {
          industry: QIndustry,
        },
      };
      type QueryArgs = {
        vat: string,
      };
      const res = await useQuery<QueryData, QueryArgs>({
        query: gql`
        query EditInfo($vat: String!) {
            company(vat: $vat) {
              uid
              legalName
              brandName
              descriptionEn
              descriptionHr
              address
              vat
              website
              industry {
                  name
              }
            }

            industries {
                name
            }
        }
        `,
        variables: {
          vat: route.params.vat as string,
        },
      })();

      industriesStore.setIndustries(res?.data?.industries);

      const info_ = companyCreate(res?.data?.company)(industriesOptions);
      const info = reactive({
        ...info_,
        vat: {
          ...info_.vat,
          disabled: false,
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
        company: res?.data?.company,
        info,
        errors,
        isLoading,
        async handleUpdate() {
          resetErrors();
          const data = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          isLoading.value = true;
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
  .container {

    .form {
      display: flex;
      flex-direction: column;
    }
  }
</style>
