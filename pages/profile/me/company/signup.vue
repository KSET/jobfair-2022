<template>
  <app-user-profile-container :not-found="!applicationsOpen" :class="$style.container">
    <h1>
      <translated-text trans-key="company-signup.header" /> {{ currentSeason.name }}
    </h1>

    <form
      style="display: contents;"
      @submit.prevent="handleFormSubmit"
    >
      <div :class="$style.panels">
        <Panel
          :class="[$style.panel, $style.panelBreakable]"
          :collapsed="false"
        >
          <template #header>
            <strong>
              <translated-text trans-key="company-signup.form.contact-person" />
            </strong>
          </template>

          <fieldset
            :class="$style.formFieldset"
          >
            <app-formgroup
              :class="$style.formContainer"
              :errors="contactPerson.errors.info"
              :inputs="contactPerson.forms.info"
              :loading="isLoading"
              no-form
            >
              <template #after>
                <div
                  v-if="contactPerson.errors.info.entity.length > 0"
                  :class="$style.errorContainer"
                >
                  <translated-text
                    v-for="err in contactPerson.errors.info.entity"
                    :key="err.message"
                    :trans-key="err.message"
                  />
                </div>
              </template>
            </app-formgroup>
          </fieldset>
        </Panel>
        <Panel
          :class="[$style.panel, $style.panelBreakable]"
          :collapsed="false"
        >
          <template #header>
            <strong>
              <translated-text trans-key="company-signup.form.signatories" />
            </strong>
          </template>

          <fieldset
            v-for="(signatory, index) in signatories"
            :key="`signatory-${index}`"
            :class="$style.formFieldset"
          >
            <legend v-if="signatories.length > 1">
              <translated-text trans-key="form.legend.signatory" /> {{ index + 1 }}
            </legend>

            <app-formgroup
              :class="$style.formContainer"
              :errors="signatory.errors"
              :inputs="signatory.forms"
              :loading="isLoading"
              no-form
            >
              <template #after>
                <div v-if="signatories.length > 1" :class="$style.signatoryButtonContainer">
                  <p-button
                    class="p-button-danger p-button-sm"
                    type="button"
                    @click="removeSignatory(index)"
                  >
                    <translated-text trans-key="form.remove-signatory" />
                  </p-button>
                </div>
              </template>
            </app-formgroup>
          </fieldset>

          <div :class="$style.signatoryButtonContainer">
            <p-button
              v-if="signatories.length < 5"
              class="p-button-secondary p-button-sm"
              type="button"
              @click="addSignatory"
            >
              <translated-text trans-key="form.add-signatory" />
            </p-button>
          </div>
        </Panel>
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
            <div>
              <strong>
                <translated-text :trans-key="`company-signup.form.${name}`" />
              </strong>
              <p
                v-if="!item.forms"
                :class="$style.itemDescription"
              >
                <translated-text :trans-key="`company-signup.form.${name}.description`" />
              </p>
            </div>

            <!-- <Checkbox v-model="item.selected" binary disabled /> -->
            <Checkbox
              v-model="item.selected"
              binary
            />
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
          </template>
          <!--          <input style="display: none;" type="submit">
          <div class="ml-auto -mt-3">
            <p-button
              :loading="isLoading"
              class="p-button-secondary font-bold"
              type="submit"
            >
              <translated-text trans-key="form.save" />
            </p-button>
          </div>-->
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

    <!-- <pre style="white-space: pre-wrap;" v-text="items" /> -->
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    ref,
    unref,
  } from "vue";
  import Panel from "primevue/panel";
  import Checkbox from "primevue/checkbox";
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
  import RadioButton from "primevue/radiobutton";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    companyApplicationContactPersonCreate,
    companyApplicationFusionCreate,
    companyApplicationPresenterCreate,
    companyApplicationTalkCreate,
    companyApplicationWorkshopCreate,
    companySignatoryCreate,
    type ContactPerson,
    type Fusion,
    type Presenter,
    type Signatory,
    type Talk,
    type Workshop,
  } from "~/helpers/forms/company-application";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    // eslint-disable-next-line camelcase
    type IPageProfileMeCompanySignup_CreateApplicationMutationVariables,
  } from "~/graphql/schema";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import useTitle from "~/composables/useTitle";
  import type {
    InputEntry,
  } from "~/components/util/form/app-formgroup.types";
  import {
    graphql,
  } from "~/graphql/client";

  enum FormFor {
    Talk = "talk",
    Workshop = "workshop",
    Fusion = "fusion",
    Cocktail = "cocktail",
    Panel = "panel",
    Quest = "quest",
  }

  export default defineComponent({
    name: "PageProfileCompanySignup",

    components: {
      // AppCheckbox,
      TranslatedText,
      AppFormgroup,
      AppUserProfileContainer,
      Panel,
      Checkbox,
      RadioButton,
    },

    async setup() {
      useTitle("company-signup.header");

      const toast = useToast();
      const userStore = useUserStore();
      const talkCategoriesStore = useTalkCategoriesStore();
      const seasonsStore = useSeasonsStore();

      const company = userStore.company!;

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

      const requireHr = company.vat.startsWith("HR");

      const resp = await useQuery({
        query: graphql(/* GraphQL */ `
          query PageProfileMeCompanySignup_Data {
              talkCategories {
                  name
              }
              booths {
                  name
                  key
              }
              companyApplication {
                  booth
                  wantsPanel
                  wantsCocktail
                  wantsQuest
                  contactPerson {
                      name
                      email
                      phone
                  }
                  talk {
                      titleEn
                      titleHr
                      descriptionEn
                      descriptionHr
                      language
                      category {
                          name
                      }
                      presenters {
                          firstName
                          lastName
                          bioHr
                          bioEn
                          photo {
                            name
                            uid
                            full {
                              mimeType
                            }
                          }
                      }
                  }
                  workshop {
                      titleEn
                      titleHr
                      descriptionEn
                      descriptionHr
                      language
                      goal
                      notesEn
                      notesHr
                      presenters {
                          firstName
                          lastName
                          bioHr
                          bioEn
                          photo {
                            name
                            uid
                            full {
                              mimeType
                            }
                          }
                      }
                  }
                  fusion {
                      titleEn
                      titleHr
                      descriptionEn
                      descriptionHr
                      language
                      category {
                          name
                      }
                      presenters {
                          firstName
                          lastName
                          bioHr
                          bioEn
                          photo {
                            name
                            uid
                            full {
                              mimeType
                            }
                          }
                      }
                  }
                  forCompany {
                      signatories {
                          fullName
                          function
                      }
                  }
              }
          }
        `),
      })().then((resp) => resp?.data);

      talkCategoriesStore.setTalkCategories(resp?.talkCategories);

      const contactPersonCreateForm = companyApplicationContactPersonCreate(resp?.companyApplication?.contactPerson)();
      const contactPerson = reactive({
        forms: {
          info: contactPersonCreateForm,
        },
        errors: {
          info: toErrors(contactPersonCreateForm),
        },
      });

      // Initialize signatories state
      const existingSignatories = resp?.companyApplication?.forCompany?.signatories;
      const initialSignatories = (existingSignatories && 0 < existingSignatories.length)
        ? existingSignatories
        : [ { fullName: "", function: "" } ];

      const signatories = ref(
        initialSignatories.map((sig: { fullName: string, function: string }) => {
          const form = companySignatoryCreate(sig)();
          return {
            forms: form,
            errors: toErrors(form),
          };
        }),
      );

      // Add/remove signatory functions
      const addSignatory = () => {
        if (5 <= signatories.value.length) {
          toast.add({
            severity: "warn",
            summary: "Maximum 5 signatories allowed",
            life: 3000,
          });
          return;
        }
        const form = companySignatoryCreate()();
        signatories.value.push({
          forms: form,
          errors: toErrors(form),
        });
      };

      const removeSignatory = (index: number) => {
        if (1 >= signatories.value.length) {
          toast.add({
            severity: "warn",
            summary: "At least 1 signatory is required",
            life: 3000,
          });
          return;
        }
        signatories.value.splice(index, 1);
      };

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
                  resp?.companyApplication?.talk,
                )({
                  requireHr,
                  categories: talkCategoriesStore.talkCategories,
                }),
                presenter: companyApplicationPresenterCreate(
                  resp?.companyApplication?.talk?.presenters[0],
                )({
                  requireHr,
                }),
              },
              selected: Boolean(resp?.companyApplication?.talk),
            },
            [FormFor.Workshop]: {
              forms: {
                info: companyApplicationWorkshopCreate(
                  resp?.companyApplication?.workshop,
                )({
                  requireHr,
                }),
                presenter: companyApplicationPresenterCreate(
                  resp?.companyApplication?.workshop?.presenters[0],
                )({
                  requireHr,
                }),
              },
              selected: Boolean(resp?.companyApplication?.workshop),
            },
            [FormFor.Fusion]: {
              forms: {
                info: companyApplicationFusionCreate(
                  resp?.companyApplication?.fusion,
                )({
                  requireHr,
                  categories: talkCategoriesStore.talkCategories,
                }),
                presenter: companyApplicationPresenterCreate(
                  resp?.companyApplication?.fusion?.presenters[0],
                )({
                  requireHr,
                }),
              },
              selected: Boolean(resp?.companyApplication?.fusion),
            },
            [FormFor.Cocktail]: {
              forms: null,
              selected: Boolean(resp?.companyApplication?.wantsCocktail),
            },
            [FormFor.Panel]: {
              forms: null,
              selected: Boolean(resp?.companyApplication?.wantsPanel),
            },
            [FormFor.Quest]: {
              forms: null,
              selected: Boolean(resp?.companyApplication?.wantsQuest),
            },
          } as const,
        ),
      );

      const booths = resp?.booths || [];

      const booth = ref(booths.find((booth) => booth.key === resp?.companyApplication?.booth) || booths[0]);

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
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        currentSeason: computed(() => seasonsStore.currentSeason),
        isLoading,
        items,
        booths,
        booth,
        contactPerson,
        signatories,
        addSignatory,
        removeSignatory,
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

          resetErrorsFor(contactPerson.errors.info);

          // eslint-disable-next-line camelcase
          const info: IPageProfileMeCompanySignup_CreateApplicationMutationVariables["info"] = {
            vat,
            signatories: signatories.value.map((sig) => toData<Signatory>(sig.forms)),
            contactPerson: toData<ContactPerson>(contactPerson.forms.info),
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
            fusion:
              selectedObj.fusion
                ? {

                  // @ts-ignore
                  ...toData<Fusion>(selectedObj.fusion.forms!.info),
                  presenter: toData<Presenter>(selectedObj.fusion.forms!.presenter),
                }
                : null,
            wantsCocktail: Boolean(selectedObj.cocktail),
            wantsPanel: Boolean(selectedObj.panel),
            wantsQuest: Boolean(selectedObj.quest),
          };

          if ("string" === typeof info.workshop?.presenter?.photo) {
            delete info.workshop.presenter.photo;
          }

          if ("string" === typeof info.talk?.presenter?.photo) {
            delete info.talk.presenter.photo;
          }

          if ("string" === typeof info.fusion?.presenter?.photo) {
            delete info.fusion.presenter.photo;
          }

          isLoading.value = true;
          const resp = await useMutation(graphql(`
            mutation PageProfileMeCompanySignup_CreateApplication($info: CompanyApplicationCreateInput!) {
              createCompanyApplication(info: $info) {
                entity {
                  talk {
                    uid
                  }
                  workshop {
                    uid
                  }
                  fusion {
                    uid
                  }
                  wantsCocktail
                  wantsPanel
                  wantsQuest
                }

                errors {
                  field
                  message
                }
              }
            }
          `))({
            info,
            }).then((resp) => resp?.data?.createCompanyApplication);
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
              summary: "Company application successfully saved",
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

            if (field.startsWith("contactPerson.")) {
              const errors = path<AuthError[]>(field.substring("contactPerson.".length), contactPerson) || [];

              errors.push({
                message,
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
        margin-top: 1rem;
      }

      &:has(legend):first-child {
        margin-top: 1.75rem;
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

    .itemDescription {
      font-size: .875rem;
      margin: 0;
      padding: .5rem 1rem;
      opacity: .8;
    }

    .signatoryButtonContainer {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
  }
</style>
