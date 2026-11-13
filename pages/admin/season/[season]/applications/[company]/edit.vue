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
            <strong>
              <translated-text :trans-key="`company-signup.form.${name}`" />
            </strong>

            <Checkbox v-model="item.selected" binary />
          </template>
          <template
            v-if="item.selected"
          >
            <template
              v-for="(form, formName) in item.forms"
              :key="`${name}--${formName}`"
            >
              <template v-if="Array.isArray(form)">
                <fieldset
                  v-for="(inputs, i) in form"
                  :key="`${formName}__${objectKey(inputs)}`"
                  :class="$style.formFieldset"
                >
                  <legend>
                    <translated-text :trans-key="`form.legend.${formName}`" />
                    <span v-if="form.length > 1">&nbsp;{{ i + 1 }}</span>
                  </legend>

                  <app-move-buttons
                    v-if="form.length > 1"
                    :count="form.length"
                    :disabled="isLoading"
                    :index="i"
                    @move="moveForm(item, formName, i, $event)"
                  />

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
            </template>
          </template>
        </Panel>
        <Panel
          v-if="panelParticipants.length > 0"
          :class="$style.panel"
          :collapsed="false"
        >
          <template #header>
            <strong>Panel Participants</strong>
          </template>

          <div
            v-for="(participant, index) in panelParticipants"
            :key="`panel-participant-${index}`"
            :class="$style.participantCard"
          >
            <img
              v-if="participant.photo"
              :src="`/api/i/${participant.photo.uid}/full`"
              :alt="`${participant.firstName} ${participant.lastName}`"
              :class="$style.participantPhoto"
            >
            <div :class="$style.participantInfo">
              <strong>{{ participant.firstName }} {{ participant.lastName }}</strong>
              <p v-if="participant.bioEn">
                <span :class="$style.participantLabel">EN:</span> {{ participant.bioEn }}
              </p>
              <p v-if="participant.bioHr">
                <span :class="$style.participantLabel">HR:</span> {{ participant.bioHr }}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div class="flex mt-3">
        <p-button
          :loading="isLoading"
          class="font-bold"
          type="button"
          severity="danger"
          @click.prevent="handleDelete"
        >
          <translated-text trans-key="form.delete" />
        </p-button>
        <p-button
          :loading="isLoading"
          class="ml-auto p-button-secondary font-bold"
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
    type IAdminCompanyApplicationQuery,
    type IAdminCompanyApplicationQueryVariables,
    // eslint-disable-next-line camelcase
    type IPageAdminSeasonApplicationsCompanyEdit_UpsertApplicationMutationVariables,
  } from "~/graphql/schema";
  import {
    useTalkCategoriesStore,
  } from "~/store/talkCategories";
  import {
    companyApplicationContactPersonCreate,
    companyApplicationFusionCreate,
    companyApplicationQuestCreate,
    companyApplicationTalkCreate,
    companyApplicationWorkshopCreate,
    companySignatoryCreate,
    moveForm,
    objectKey,
    presenterForms,
    toPresenterInput,
    type ContactPerson,
    type Fusion,
    type Presenter,
    type Quest,
    type Signatory,
    type Talk,
    type Workshop,
  } from "~/helpers/forms/company-application";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import AppMoveButtons from "~/components/util/form/app-move-buttons.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    graphql,
  } from "~/graphql/client";
  import type {
    InputEntry,
  } from "~/components/util/form/app-formgroup.types";

  enum FormFor {
    Talk = "talk",
    Workshop = "workshop",
    Fusion = "fusion",
    Cocktail = "cocktail",
    Panel = "panel",
    Quest = "quest",
  }

  export default defineComponent({
    name: "PageAdminCompanySignupEdit",

    components: {
      TranslatedText,
      AppFormgroup,
      AppMoveButtons,
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
        <T>(form: T): Record<keyof T | "entity", AuthError[]> =>
          mapObject(
            () => [] as AuthError[],
            {
              ...form,
              entity: "",
            },
          ) as Record<keyof T | "entity", AuthError[]>
      ;
      const toFormErrors =
        <T>(form: T | T[]) =>
          Array.isArray(form)
            ? form.map((f) => toErrors(f))
            : toErrors(form)
      ;

      const company = resp?.companyApplicationFor?.forCompany;
      const application = resp?.companyApplicationFor;
      const booths = resp?.booths || [];
      const panelParticipants = application?.panelParticipants || [];

      const requireHr = company?.vat.startsWith("HR");

      const approval = application?.approval;

      const contactPersonCreateForm = companyApplicationContactPersonCreate(resp?.companyApplicationFor?.contactPerson)();
      const contactPerson = reactive({
        forms: {
          info: contactPersonCreateForm,
        },
        errors: {
          info: toErrors(contactPersonCreateForm),
        },
      });

      const existingSignatories = company?.signatories;
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
                  toFormErrors,
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
                presenter: presenterForms(
                  application?.talk?.presenters,
                  approval?.talkParticipants,
                  { requireHr },
                ),
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
                presenter: presenterForms(
                  application?.workshop?.presenters,
                  approval?.workshopParticipants,
                  { requireHr },
                ),
              },
              selected: Boolean(application?.workshop),
            },
            [FormFor.Fusion]: {
              forms: {
                info: companyApplicationFusionCreate(
                  application?.fusion,
                )({
                  requireHr,
                  categories: talkCategoriesStore.talkCategories,
                }),
                presenter: presenterForms(
                  application?.fusion?.presenters,
                  approval?.fusionParticipants,
                  { requireHr },
                ),
              },
              selected: Boolean(application?.fusion),
            },
            [FormFor.Cocktail]: {
              forms: null,
              selected: Boolean(application?.wantsCocktail),
            },
            [FormFor.Panel]: {
              forms: null,
              selected: Boolean(application?.wantsPanel),
            },
            [FormFor.Quest]: {
              forms: {
                info: companyApplicationQuestCreate(
                  application?.quest,
                )(),
              },
              selected: Boolean(application?.wantsQuest),
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

      const { vat } = (company!);

      return {
        applicationFound: Boolean(application),
        isLoading,
        items,
        booths,
        booth,
        company,
        contactPerson,
        panelParticipants,
        signatories,
        addSignatory,
        removeSignatory,
        objectKey,
        moveForm,
        async handleDelete() {
          if (!confirm("Are you sure you want to delete this application?")) {
            return;
          }

          isLoading.value = true;
          const resp = await useMutation(graphql(/* GraphQL */`
          mutation PageAdminSeasonApplicationsCompanyEdit_DeleteApplication($company: String!, $season: String!) {
            deleteCompanyApplicationFor(
              company: $company
              season: $season
            )
          }
          `))({
            company: companyUid,
            season: seasonUid,
            }).then((x) => x?.data?.deleteCompanyApplicationFor);
          isLoading.value = false;

          if (!resp) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 3000,
            });
          } else {
            toast.add({
              severity: "success",
              summary: "Prijava izbrisana",
              closable: true,
              life: 3000,
            });
            await navigateTo(`/admin/season/${ seasonUid }/applications`);
          }
        },
        async handleFormSubmit() {
          const selectedObj = filter((item) => item.selected, items);
          for (const item of Object.values(items)) {
            if (item.errors) {
              for (const errors of Object.values(item.errors)) {
                for (const formErrors of (Array.isArray(errors) ? errors : [ errors ])) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  resetErrorsFor(formErrors as any);
                }
              }
            }
          }
          resetErrorsFor(contactPerson.errors.info);

          const sentPresenterIndexes: Record<string, number[]> = {};
          const presentersToSend = (event: string, forms: Record<keyof Presenter, InputEntry>[]) => {
            const isEmpty = (inputs: Record<keyof Presenter, InputEntry>) => Object.values(inputs).every((input) => !input.value);
            const filled = forms.map((_, i) => i).filter((i) => !isEmpty(forms[i]));
            const indexes = 0 < filled.length ? filled : [ 0 ];

            sentPresenterIndexes[event] = indexes;

            return indexes.map((i) => toPresenterInput(forms[i]));
          };

          // eslint-disable-next-line camelcase
          const info: IPageAdminSeasonApplicationsCompanyEdit_UpsertApplicationMutationVariables["info"] = {
            vat,
            contactPerson: toData<ContactPerson>(contactPerson.forms.info),
            signatories: signatories.value.map((sig) => toData<Signatory>(sig.forms)),
            booth: unref(booth).key,
            talk:
              selectedObj.talk
                ? {
                  // @ts-ignore
                  ...toData<Talk>(selectedObj.talk.forms!.info),
                  presenter: presentersToSend("talk", selectedObj.talk.forms!.presenter),
                }
                : null,
            workshop:
              selectedObj.workshop
                ? {
                  // @ts-ignore
                  ...toData<Workshop>(selectedObj.workshop.forms!.info),
                  presenter: presentersToSend("workshop", selectedObj.workshop.forms!.presenter),
                }
                : null,
            fusion:
              selectedObj.fusion
                ? {
                  // @ts-ignore
                  ...toData<Fusion>(selectedObj.fusion.forms!.info),
                  presenter: presentersToSend("fusion", selectedObj.fusion.forms!.presenter),
                }
                : null,
            quest:
              selectedObj.quest
                ? toData<Quest>(selectedObj.quest.forms!.info)
                : null,
            wantsCocktail: Boolean(selectedObj.cocktail),
            wantsPanel: Boolean(selectedObj.panel),
            wantsQuest: Boolean(selectedObj.quest),
          };

          isLoading.value = true;
          const resp = await useMutation(graphql(/* GraphQL */`
            mutation PageAdminSeasonApplicationsCompanyEdit_UpsertApplication($company: String!, $season: String!, $info: CompanyApplicationCreateInput!) {
                createCompanyApplicationFor(company: $company, season: $season, info: $info) {
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
                        quest {
                            prize
                        }
                    }

                    errors {
                        field
                        message
                    }
                }
            }
            `))({
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
                const [ form, part, input, ...rest ] = err.field.split(".");

                if (!input) {
                  err.field = [ form, "errors", "info", part ].join(".");
                } else if ("presenter" === part && sentPresenterIndexes[form]) {
                  const formIndex = sentPresenterIndexes[form][Number(input)] ?? input;
                  err.field = [ form, "errors", part, formIndex, ...rest ].join(".");
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

    .signatoryButtonContainer {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .participantCard {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid color.adjust($fer-black, $alpha: -.9);
      border-radius: 4px;
      background-color: $fer-off-gray;

      & + & {
        margin-top: 0.75rem;
      }
    }

    .participantPhoto {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: 4px;
      object-fit: cover;
    }

    .participantInfo {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      p {
        margin: 0;
      }
    }

    .participantLabel {
      font-weight: 600;
      opacity: 0.6;
    }
  }
</style>
