<template>
  <app-max-width-container
    :class="$style.container"
    :not-found="!applicationFound"
  >
    <h1>Uredi prijavu</h1>

    <div :class="$style.companyInfo">
      <h2 v-text="company.brandName" />
      <h3 v-text="company.legalName" />
      <h3 v-text="company.vat" />
    </div>

    <form
      style="display: contents;"
      @submit.prevent="handleFormSubmit"
    >
      <div :class="$style.panels">
        <Panel
          :class="[$style.panel, $style.panelBreakable]"
          collapsed
        >
          <template #header>
            <strong>
              <translated-text trans-key="company-signup.form.booth" />
            </strong>

            <div
              :style="{
                gap: '1rem',
              }"
              class="flex flex-row"
            >
              <div
                v-for="category of booths"
                :key="category.key"
              >
                <label
                  class="ml-2"
                >
                  <RadioButton
                    :id="category.key"
                    v-model="booth"
                    :value="category"
                    name="booth"
                  />
                  {{ category.name }}
                </label>
              </div>
            </div>
          </template>
        </Panel>
        <Panel
          v-for="(item, name) in items"
          :key="name"
          :class="$style.panel"
          :collapsed="item.forms ? !item.selected : true"
        >
          <template #header>
            <strong>
              <translated-text :trans-key="`company-signup.form.${name}`" />
            </strong>

            <Checkbox v-model="item.selected" binary disabled />
          </template>
          <template
            v-if="item.selected"
          >
            <fieldset
              v-for="(form, formName) in item.forms"
              :key="`${name}--${formName}`"
              :class="$style.formFieldset"
            >
              <legend>
                <translated-text :trans-key="`form.legend.${formName}`" />
              </legend>

              <LazyClientOnly>
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
              </LazyClientOnly>
            </fieldset>
          </template>
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
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
    unref,
  } from "vue";
  import {
    useRoute,
  } from "vue-router";
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
  import Panel from "primevue/panel";
  import Checkbox from "primevue/checkbox";
  import RadioButton from "primevue/radiobutton";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    AdminCompanyApplication,
    AdminCreateCompanyApplication,
    IAdminCompanyApplicationQuery,
    IAdminCompanyApplicationQueryVariables,
    IAdminCreateCompanyApplicationMutation,
    IAdminCreateCompanyApplicationMutationVariables,
  } from "~/graphql/schema";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import {
    companyApplicationPresenterCreate,
    companyApplicationTalkCreate,
    companyApplicationWorkshopCreate,
    Presenter,
    Talk,
    Workshop,
  } from "~/helpers/forms/company-application";
  import AppFormgroup, {
    InputEntry,
  } from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";

  enum FormFor {
    Talk = "talk",
    Workshop = "workshop",
    Cocktail = "cocktail",
    Panel = "panel",
  }

  export default defineComponent({
    name: "PageAdminCompanySignupEdit",

    components: {
      TranslatedText,
      AppFormgroup,
      AppMaxWidthContainer,
      Panel,
      Checkbox,
      RadioButton,
    },

    async setup() {
      const toast = useToast();
      const route = useRoute();
      const talkCategoriesStore = useTalkCategoriesStore();

      const companyUid = route.params.company as string;
      const seasonUid = route.params.season as string;

      const isLoading = ref(false);

      const resp = await useQuery<IAdminCompanyApplicationQuery, IAdminCompanyApplicationQueryVariables>({
        query: AdminCompanyApplication,
        variables: {
          company: companyUid,
          season: seasonUid,
        },
      })().then((resp) => resp?.data);

      type AuthError = {
        message: string,
      };
      const toErrors =
        <T>(form: T) =>
          mapObject(
            () => [] as AuthError[],
            {
              ...form,
              entity: "",
            },
          ) as Record<keyof T | "entity", AuthError[]>
      ;

      const company = resp?.companyApplicationFor?.forCompany;
      const application = resp?.companyApplicationFor;
      const booths = resp?.booths || [];

      const requireHr = company?.vat.startsWith("HR");

      const items = reactive(
        map(
          (x) => ({
            ...x,
            errors:
              x.forms
                ? map(
                  toErrors,
                  // @ts-ignore
                  x.forms,
                )
                : null
            ,
          }),
          {
            [FormFor.Talk]: {
              forms: {
                info: companyApplicationTalkCreate(
                  application?.talk,
                )({
                  requireHr,
                  categories: talkCategoriesStore.talkCategories,
                }),
                presenter: companyApplicationPresenterCreate(
                  application?.talk?.presenters[0],
                )({
                  requireHr,
                }),
              },
              selected: Boolean(application?.talk),
            },
            [FormFor.Workshop]: {
              forms: {
                info: companyApplicationWorkshopCreate(
                  application?.workshop,
                )({
                  requireHr,
                }),
                presenter: companyApplicationPresenterCreate(
                  application?.workshop?.presenters[0],
                )({
                  requireHr,
                }),
              },
              selected: Boolean(application?.workshop),
            },
            [FormFor.Cocktail]: {
              forms: null,
              selected: Boolean(application?.wantsCocktail),
            },
            [FormFor.Panel]: {
              forms: null,
              selected: Boolean(application?.wantsPanel),
            },
          } as const,
        ),
      );

      talkCategoriesStore.setTalkCategories(resp?.talkCategories);

      const booth = ref(booths.find((booth) => booth.key === application?.booth) || booths[0]);
      const toData =
        <T>(info: Record<keyof T, InputEntry>) =>
          pipe(
            (x: Record<keyof T, InputEntry>) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info) as Record<keyof T, string>
      ;
      const resetErrorsFor = <T>(errors: Record<keyof T | "entity", AuthError[]>) => keys(errors).forEach((key) => errors[key] = []);

      const vat = company?.vat;

      return {
        applicationFound: Boolean(application),
        isLoading,
        items,
        booths,
        booth,
        company,
        async handleFormSubmit() {
          const selectedObj = filter((item) => item.selected, items);
          for (const item of Object.values(items)) {
            if (item.errors) {
              for (const errors of Object.values(item.errors)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                resetErrorsFor(errors as any);
              }
            }
          }

          const info: IAdminCreateCompanyApplicationMutationVariables["info"] = {
            vat,
            booth: unref(booth).key,
            talk:
              selectedObj.talk
                ? {
                  // @ts-ignore
                  ...toData<Talk>(selectedObj.talk.forms!.info),
                  presenter: toData<Presenter>(selectedObj.talk.forms!.presenter),
                }
                : null,
            workshop:
              selectedObj.workshop
                ? {
                  // @ts-ignore
                  ...toData<Workshop>(selectedObj.workshop.forms!.info),
                  presenter: toData<Presenter>(selectedObj.workshop.forms!.presenter),
                }
                : null,
            wantsCocktail: Boolean(selectedObj.cocktail),
            wantsPanel: Boolean(selectedObj.panel),
          };

          if ("string" === typeof info.workshop?.presenter?.photo) {
            delete info.workshop.presenter.photo;
          }

          if ("string" === typeof info.talk?.presenter?.photo) {
            delete info.talk.presenter.photo;
          }

          isLoading.value = true;
          const resp = await useMutation<IAdminCreateCompanyApplicationMutation, IAdminCreateCompanyApplicationMutationVariables>(AdminCreateCompanyApplication)({
            info,
            company: companyUid,
            season: seasonUid,
          }).then((resp) => resp?.data?.createCompanyApplicationFor);
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
                const [ form, part, input ] = err.field.split(".");

                if (!input) {
                  err.field = [ form, "errors", "info", part ].join(".");
                } else {
                  err.field = [ form, "errors", part, input ].join(".");
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

    .companyInfo {
      overflow: hidden;
      flex-direction: column;
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 4px;
      background-color: $background-color;
      box-shadow: #{map.get($shadows, "shadow-3")};
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
  }
</style>
