<template>
  <app-user-profile-container
    :class="$style.container"
    :not-found="!canEdit"
  >
    <h1>
      <translated-text trans-key="company-signup.header" />
      {{ currentSeason.name }}
    </h1>

    <form
      style="display: contents;"
      @submit.prevent="handleFormSubmit"
    >
      <div :class="$style.panels">
        <Panel
          v-for="(item, name) in items"
          :key="name"
          :class="$style.panel"
        >
          <template #header>
            <strong>
              <translated-text :trans-key="`company-signup.form.${name}`" />
            </strong>
          </template>

          <div
            v-for="(form, formName) in item.forms"
            :key="`${name}--${formName}`"
            :class="$style.dContents"
          >
            <template
              v-if="Array.isArray(form)"
            >
              <fieldset
                v-for="(inputs, i) in form"
                :key="`${formName}__${i}`"
                :class="$style.formFieldset"
              >
                <legend>
                  <translated-text :trans-key="`form.legend.${formName}`" />
                  <span v-if="form.length > 1">&nbsp;{{ i + 1 }}</span>
                </legend>

                <app-formgroup
                  :errors="item.errors[formName][i]"
                  :inputs="inputs"
                  :loading="isLoading"
                  no-form
                />
              </fieldset>
            </template>
            <fieldset
              v-else
              :class="$style.formFieldset"
            >
              <legend>
                <translated-text :trans-key="`form.legend.${formName}`" />
              </legend>

              <app-formgroup
                :class="$style.formContainer"
                :errors="item.errors[formName]"
                :inputs="form"
                :loading="isLoading"
                no-form
              >
                <template #after>
                  <div
                    v-if="item.errors[formName].entity.length > 0"
                    :class="$style.errorContainer"
                  >
                    <translated-text
                      v-for="err in item.errors[formName].entity"
                      :key="err.message"
                      :trans-key="err.message"
                    />
                  </div>
                </template>
              </app-formgroup>
            </fieldset>
          </div>
        </Panel>
      </div>

      <div class="text-right mt-3">
        <p-button
          :loading="isLoading"
          class="p-button-secondary font-bold"
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
    computed,
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import Panel from "primevue/panel";
  import {
    filter,
    keys,
    map,
    mapObject,
    path,
    pipe,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useMutation,
  } from "~/composables/useQuery";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    companyApplicationCocktailCreate,
    companyApplicationFusionCreate,
    companyApplicationInternshipCreate,
    companyApplicationPresenterCreate,
    companyApplicationTalkCreate,
    companyApplicationWorkshopCreate,
    type Fusion,
    type Presenter,
    type Talk,
    type Workshop,
  } from "~/helpers/forms/company-application";
  import AppFormgroup, {
    type InputEntry,
  } from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    EditApprovedCompanyApplication,
    type ICompanyApplicationApproval,
    type ICurrentCompanyApplicationQuery,
    type IEditApprovedCompanyApplicationMutation,
    type IEditApprovedCompanyApplicationMutationVariables,
  } from "~/graphql/schema";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import {
    useCocktailTypesStore,
  } from "~/store/cocktailTypes";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import useTitle from "~/composables/useTitle";
  import {
    useCompanyStore,
  } from "~/store/company";

  enum FormFor {
    Talk = "talk",
    Workshop = "workshop",
    Fusion = "fusion",
    Cocktail = "cocktail",
    Panel = "panel",
    Quest = "quest",
    Internship = "internship",
  }

  const FormToApproval: Partial<Record<FormFor, keyof ICompanyApplicationApproval>> = {
    [FormFor.Panel]: "panel",
    [FormFor.Talk]: "talkParticipants",
    [FormFor.Workshop]: "workshopParticipants",
    [FormFor.Fusion]: "fusionParticipants",
    [FormFor.Cocktail]: "cocktail",
    [FormFor.Quest]: "quest",
    [FormFor.Internship]: undefined,
  };


  export default defineComponent({
    name: "PageProfileCompanyApplicationEdit",

    components: {
      TranslatedText,
      AppFormgroup,
      AppUserProfileContainer,
      Panel,
    },

    setup() {
      useTitle("company-signup.header");

      const toast = useToast();
      const userStore = useUserStore();
      const companyStore = useCompanyStore();
      const talkCategoriesStore = useTalkCategoriesStore();
      const cocktailTypesStore = useCocktailTypesStore();
      const seasonsStore = useSeasonsStore();

      const company = userStore.company!;

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

      const requireHr = company.vat.startsWith("HR");
      const resp = companyStore.applicationInfo!;
      const companyApplication = resp.companyApplication!;
      const { approval } = companyApplication;

      const extendTo =
        <T>(
          arr: T[] | undefined | null,
          len: number,
          ): (T | null)[] => [
            ...(arr || []),
            ...new Array<null>(Math.max(0, len - (arr?.length || 0))).fill(null),
          ]
      ;

      const form =
        <T extends Record<string, unknown>>(x: T) => ({
          forms: x,
          errors: (
            x
              ? map(toErrors, x)
              : null
          ),
          selected: true,
        })
      ;

      const forms = {
        [FormFor.Talk]: form({
          info: companyApplicationTalkCreate(
            companyApplication.talk,
          )({
            requireHr,
            categories: talkCategoriesStore.talkCategories,
          }),
          presenter:
            extendTo(
              companyApplication.talk?.presenters,
              approval?.talkParticipants || 1,
            )
              .map(
                (p) =>
                  companyApplicationPresenterCreate(
                    p,
                  )({
                    requireHr,
                  })
                ,
              )
          ,
        }),
        [FormFor.Workshop]: form({
          info: companyApplicationWorkshopCreate(
            companyApplication.workshop,
          )({
            requireHr,
          }),
          presenter:
            extendTo(
              companyApplication.workshop?.presenters,
              approval?.workshopParticipants || 1,
            )
              .map(
                (p) =>
                  companyApplicationPresenterCreate(
                    p,
                  )({
                    requireHr,
                  })
                ,
              )
          ,
        }),
        [FormFor.Fusion]: form({
          info: companyApplicationFusionCreate(
            companyApplication.fusion ?? null,
          )({
            requireHr,
            categories: talkCategoriesStore.talkCategories,
          }),
          presenter:
            extendTo(
              companyApplication.fusion?.presenters,
              approval?.fusionParticipants || 1,
            )
              .map(
                (p) =>
                  companyApplicationPresenterCreate(
                    p,
                  )({
                    requireHr,
                  })
                ,
              )
          ,
        }),
        [FormFor.Cocktail]: form({
          info: companyApplicationCocktailCreate(
            companyApplication.cocktail,
          )({
            cocktailTypes: cocktailTypesStore.cocktailTypes,
          }),
        }),
        [FormFor.Panel]: form({
          presenter: extendTo<NonNullable<ICurrentCompanyApplicationQuery["companyApplication"]>["panelParticipants"][0]>(
            companyApplication.panelParticipants,
            1,
          ).map(
            (x) =>
              companyApplicationPresenterCreate(
                x,
              )()
            ,
          ),
        }),
        [FormFor.Internship]: form({
          info: companyApplicationInternshipCreate(
            companyApplication.internship,
          )(),
        }),
      };

      const filtered = filter(
        (_: unknown, formKey: string) => {
          const key = FormToApproval[formKey as FormFor];
          return key ? Boolean(approval?.[key]) : false;
        },
        forms,
      ) as typeof forms;

      const items = reactive({
        ...filtered,
        [FormFor.Internship]: forms[FormFor.Internship],
      });
      const booths = resp?.booths || [];

      const booth = ref(booths.find((booth) => booth.key === companyApplication.booth) || booths[0]);

      const toData =
        <T>(info: Record<keyof T, InputEntry>) =>
          pipe(
            (x: Record<keyof T, InputEntry>) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info) as Record<keyof T, string>
      ;
      const resetErrorsFor = <T>(errors: Record<keyof T | "entity", AuthError[]>) => keys(errors).forEach((key) => errors[key] = []);

      const { vat } = company;
      const isLoading = ref(false);

      return {
        canEdit: computed(() => seasonsStore.applicationsOpen || companyStore.hasApplicationApproved),
        currentSeason: computed(() => seasonsStore.currentSeason),
        isLoading,
        items,
        booths,
        booth,
        async handleFormSubmit() {
          for (const item of Object.values(items)) {
            if (item.errors) {
              for (const errors of Object.values(item.errors)) {
                Array.isArray(errors)
                  ? errors.forEach(resetErrorsFor)
                  : resetErrorsFor(errors)
                ;
              }
            }
          }

          const info: IEditApprovedCompanyApplicationMutationVariables["info"] = {
            vat,
            talk:
              items[FormFor.Talk]
                ? {
                  ...toData<Talk>(items[FormFor.Talk].forms.info),
                  presenter: items[FormFor.Talk].forms.presenter?.map((p) => toData<Presenter>(p)),
                }
                : null,
            workshop:
              items[FormFor.Workshop]
                ? {
                  ...toData<Workshop>(items[FormFor.Workshop].forms.info),
                  presenter: items[FormFor.Workshop].forms.presenter?.map((p) => toData<Presenter>(p)),
                }
                : null,
            fusion:
              items[FormFor.Fusion]
                ? {
                  ...toData<Fusion>(items[FormFor.Fusion].forms.info),
                  presenter: items[FormFor.Fusion].forms.presenter?.map((p) => toData<Presenter>(p)),
                }
                : null,
            cocktail:
              items[FormFor.Cocktail]
                ? toData(items[FormFor.Cocktail].forms.info)
                : null,
            panel:
              items[FormFor.Panel]
                ? [
                  toData(items[FormFor.Panel].forms.presenter[0]),
                ]
                : [],
            internship: items[FormFor.Internship]
              ? (() => {
                const data = toData(items[FormFor.Internship].forms.info);
                return {
                  ...data,
                  workingPeriodStart: new Date(data.workingPeriodStart),
                  workingPeriodEnd: new Date(data.workingPeriodEnd),
                };
              })()
              : null,
          };

          for (const presenter of (info[FormFor.Talk]?.presenter || [])) {
            if ("string" === typeof presenter.photo) {
              delete presenter.photo;
            }
          }

          for (const presenter of (info[FormFor.Workshop]?.presenter || [])) {
            if ("string" === typeof presenter.photo) {
              delete presenter.photo;
            }
          }

          for (const presenter of (info[FormFor.Fusion]?.presenter || [])) {
            if ("string" === typeof presenter?.photo) {
              delete presenter.photo;
            }
          }

          for (const presenter of (info[FormFor.Panel] || [])) {
            if ("string" === typeof presenter.photo) {
              delete presenter.photo;
            }
          }

          isLoading.value = true;
          const resp = await useMutation<IEditApprovedCompanyApplicationMutation, IEditApprovedCompanyApplicationMutationVariables>(EditApprovedCompanyApplication)({
            info,
          }).then((resp) => resp?.data?.editApprovedCompanyApplication);
          isLoading.value = false;

          if (!resp) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 3000,
            });
          }

          if (!resp.errors) {
            return toast.add({
              severity: "success",
              summary: "Saved",
              closable: true,
              life: 3000,
            });
          }

          const errorList =
            resp
              .errors
              .map((err) => {
                const parts = err.field.split(".");
                const [ form, part, input, ...rest ] = parts;

                if ("panel" === form) {
                  err.field = [ form, "errors", "presenter", ...parts.slice(1) ].join(".");
                } else if (!input) {
                  err.field = [ form, "errors", "info", part, ...rest ].join(".");
                } else {
                  err.field = [ form, "errors", part, input, ...rest ].join(".");
                }

                return err;
              })
          ;

          for (const { field, message } of errorList) {
            if ("entity.errors.info." === field) {
              toast.add({
                severity: "error",
                summary: message,
                closable: true,
                life: 0,
              });
              continue;
            }

            const errors = path<AuthError[]>(field, items) || [];

            errors.push({
              message,
            });
          }

          toast.add({
            severity: "warn",
            summary: "Please check your form for errors",
            closable: true,
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    $background-color: $fer-off-gray;
    $border-color: color.adjust($fer-black, $alpha: -.9);

    .dContents {
      display: contents;
    }

    .panels {
      overflow: hidden;
      flex-direction: column;
      border-radius: 4px;
      box-shadow: #{map.get($shadows, "shadow-3")};
    }

    .panel {
      border-radius: 0;
      box-shadow: none;

      &.panelBreakable {

        :global(.p-panel-header) {
          @include media(lg) {
            flex-direction: column;
            gap: 1.5rem;
          }
        }
      }

      :global(.p-panel-icons) {
        display: none;
      }

      :global(.p-panel-header) {
        display: flex;
        flex-direction: row;
        width: 100%;
        min-height: 3.5rem;
        border-bottom: 2px solid #{$border-color};
        border-radius: 0;
        background: $background-color;

        > :first-child {
          flex: 1;
        }
      }

      :global(.p-panel-content) {
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      &:last-child {

        :global(.p-panel-header) {
          border-bottom: none;
        }
      }
    }

    .formFieldset {
      $border: 1px solid #{$border-color};

      position: relative;
      padding: 1rem 1.5rem;
      border: $border;
      border-radius: 4px;
      background-color: $background-color;

      &:first-child {
        margin-top: .875rem;
      }

      > legend {
        font-weight: bold;
        padding: .25rem .875rem;
        transform: translateY(calc(-50% + 1px));
        border: $border;
        border-bottom-color: transparent;
        border-radius: 4px 4px 0 0;
        background-color: $background-color;
      }
    }

    .formContainer {
      gap: 1rem;

      .errorContainer {
        font-weight: bold;
        display: flex;
        flex-direction: column;
        text-align: center;
        color: $fer-error;
        gap: .5rem;

        @include media(lg) {
          grid-column: initial;
        }
      }
    }

    .formMultipleContainer {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  }
</style>
