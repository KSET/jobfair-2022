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
    companyApplicationPresenterCreate,
    companyApplicationTalkCreate,
    companyApplicationWorkshopCreate,
    type ContactPerson,
    type Presenter,
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
    Cocktail = "cocktail",
    Panel = "panel",
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
              }
          }
        `),
      })().then((resp) => resp?.data);

      console.log("talkCategoriesStore-b4", talkCategoriesStore.talkCategories);
      talkCategoriesStore.setTalkCategories(resp?.talkCategories);
      console.log("talkCategoriesStore-after", talkCategoriesStore.talkCategories);

      const contactPersonCreateForm = companyApplicationContactPersonCreate(resp?.companyApplication?.contactPerson)();
      const contactPerson = reactive({
        forms: {
          info: contactPersonCreateForm,
        },
        errors: {
          info: toErrors(contactPersonCreateForm),
        },
      });

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
            [FormFor.Cocktail]: {
              forms: null,
              selected: Boolean(resp?.companyApplication?.wantsCocktail),
            },
            [FormFor.Panel]: {
              forms: null,
              selected: Boolean(resp?.companyApplication?.wantsPanel),
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
                  wantsCocktail
                  wantsPanel
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
  }
</style>
