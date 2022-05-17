<template>
  <app-user-profile-container :class="$style.container">
    <h1>
      <translated-text trans-key="company-feedback.header" />
    </h1>

    <form :class="$style.forms" @submit.prevent="handleSave">
      <div v-for="(form, formName) in forms" :key="formName" :class="$style.form">
        <h2>
          <translated-text :trans-key="`company-feedback.form.${formName}`" />
        </h2>
        <blockquote>
          <translated-text :trans-key="`company-feedback.form.${formName}.comment`" />
        </blockquote>
        <app-formgroup
          :errors="form.errors"
          :inputs="form.inputs"
          :loading="isLoading"
          class="mt-4"
          label-prefix="company-feedback"
          no-form
        />
      </div>
      <div class="flex">
        <p-button
          :loading="isLoading"
          class="p-button-secondary font-bold ml-auto"
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
    fromPairs,
    map,
    mapObject,
    toPairs,
    values,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    unref,
    useMutation,
    useTitle,
  } from "#imports";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    companyApplicationFeedbackDate,
    companyApplicationFeedbackExperience,
    companyApplicationFeedbackOrganisation,
    companyApplicationFeedbackOverall,
  } from "~/helpers/forms/company-application";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    ICompanyApplicationFeedback,
    ICompanyApplicationFeedbackCreateInput,
  } from "~/graphql/schema";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "PageProfileCompanyFeedbackForm",

    components: {
      AppFormgroup,
      TranslatedText,
      AppUserProfileContainer,
    },

    setup() {
      useTitle("company-feedback.header");

      const companyStore = useCompanyStore();
      const translationsStore = useTranslationsStore();
      const toast = useToast();

      const isLoading = ref(false);

      const $t = computed(() => translationsStore.translation);
      const feedback = companyStore.applicationInfo?.companyApplication?.feedback;

      type AuthError = {
        message: string,
      };
      const toErrors =
        <T, R extends Record<keyof T | "entity", AuthError[]>>(form: T | T[]): R | R[] =>
          Array.isArray(form)
            ? form.map(toErrors) as R[]
            : mapObject(
              () => [] as AuthError[],
              {
                ...form,
                entity: "",
              },
            ) as R
      ;

      const toForm =
        <T extends Record<string, unknown>>(x: T) => ({
          inputs: x,
          errors: (
            x
              ? map(toErrors, x)
              : null
          ),
        })
      ;

      const mostLikedOptions = computed(() =>
        [
          "form.company-feedback.experience.mostLiked.1",
          "form.company-feedback.experience.mostLiked.2",
          "form.company-feedback.experience.mostLiked.3",
          "form.company-feedback.experience.mostLiked.4",
          "form.company-feedback.experience.mostLiked.5",
          "form.company-feedback.experience.mostLiked.6",
          "form.company-feedback.experience.mostLiked.7",
        ].map((key) => unref($t)(key)),
      );

      const recommendedOptions = computed(() =>
        [
          "form.company-feedback.overall.recommended.1",
          "form.company-feedback.overall.recommended.2",
          "form.company-feedback.overall.recommended.3",
        ].map((key) => unref($t)(key)),
      );

      const forms = reactive({
        date: toForm(companyApplicationFeedbackDate(feedback)()),
        organisation: toForm(companyApplicationFeedbackOrganisation(feedback)()),
        experience: toForm(companyApplicationFeedbackExperience(feedback)({
          mostLiked: mostLikedOptions,
        })),
        overall: toForm(companyApplicationFeedbackOverall(feedback)({
          recommended: recommendedOptions,
        })),
      });

      return {
        forms,
        isLoading,
        async handleSave() {
          const toData =
            (form: typeof forms) =>
              fromPairs(
                values(form)
                  .flatMap(({ inputs }) => toPairs(inputs) as [ string, { value: unknown, } ][])
                  .map(([ key, input ]) => [ key, input.value ])
                ,
              ) as ICompanyApplicationFeedbackCreateInput
          ;

          type QArgs = {
            data: ICompanyApplicationFeedbackCreateInput,
          };
          type QData = Pick<ICompanyApplicationFeedback,
                            "createdAt"
                              | "updatedAt">;

          const data = toData(forms);
          data.recommended = Number(data.recommended);
          // eslint-disable-next-line no-bitwise
          data.mostLiked = (data.mostLiked as unknown as string[]).reduce((acc, x) => acc | Number(x), 0);

          isLoading.value = true;
          const resp =
            await useMutation<{ updateCompanyApplicationFeedback: QData, }, QArgs>(gql`
              mutation Update($data: CompanyApplicationFeedbackCreateInput!) {
                updateCompanyApplicationFeedback(input: $data) {
                  applicationComments
                  applicationRating
                  attendanceRating
                  dateComments
                  dateRating
                  experienceComments
                  foodRating
                  mostLiked
                  onsiteRating
                  overallRating
                  recommended
                  testimonial
                  timeRating
                  createdAt
                  updatedAt
                }
              }
            `)({
              data,
            })
              .then((resp) => resp?.data?.updateCompanyApplicationFeedback)
          ;
          isLoading.value = false;

          if (!resp) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 5000,
            });
          }

          toast.add({
            severity: "success",
            summary: "Saved",
            closable: true,
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    .forms {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 2rem;

      .form {
        display: block;
      }
    }
  }
</style>
