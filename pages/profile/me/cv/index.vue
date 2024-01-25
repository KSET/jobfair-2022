<template>
  <app-user-profile-container :class="$style.container">
    <h1>
      <translated-text trans-key="profile.cv" />
    </h1>
    <h2 v-if="resume">
      <span>
        <translated-text
          trans-key="profile.cv.last-edited"
        />:
        <app-time :time="resume.updatedAt" />
      </span>
    </h2>
    <form
      :class="$style.contents"
      @submit.prevent="handleFormSubmit"
    >
      <div
        v-for="(item, name) in items"
        :key="name"
        :class="$style.part"
      >
        <h2>
          <translated-text :trans-key="`profile.cv.form.${name}`" />
        </h2>

        <template v-if="name === FormFor.Interests || name === FormFor.Technologies">
          <div :class="$style.autocomplete">
            <div :class="$style.contents">
              <AppAutocomplete
                v-model="item.fields.name.value"
                :class="$style.autocompleteInput"
                :loading="isLoading"
                :suggestions="infoFor[name].suggestions"
                :name="name"
                @keydown.enter="noop"
                @complete="searchFields(name, $event)"
                @item-select="onSelected(name, $event)"
              />
            </div>
            <div :class="$style.autocompleteChips">
              <Chip
                v-for="sel in infoFor[name].selected"
                :key="sel"
                :label="sel"
                :removable="!isLoading"
                @remove="removeAutocompleted(name, sel)"
              />
            </div>
          </div>
        </template>
        <template v-else-if="Array.isArray(item.fields)">
          <app-formgroup
            v-for="(inputs, i) in item.fields"
            :key="`${name}__${i}`"
            :class="$style.partForm"
            :errors="item.errors[i]"
            :inputs="inputs"
            :label-prefix="`cv.${name}`"
            :loading="isLoading"
            no-form
          >
            <template #after>
              <p-button
                :class="$style.removeButton"
                :loading="isLoading"
                class="p-button-danger"
                @click.prevent="removePart(name, i)"
              >
                <i class="pi pi-trash p-button-icon p-button-icon-left" />
                <span class="p-button-label">
                  <translated-text trans-key="form.delete" />
                </span>
              </p-button>
            </template>
          </app-formgroup>

          <div :class="$style.addPart">
            <p-button
              :loading="isLoading"
              class="p-button-secondary"
              @click.prevent="addPart(name)"
            >
              <i class="pi pi-plus p-button-icon p-button-icon-left" />
              <span class="p-button-label">
                <translated-text :trans-key="`form.cv.add.${name}`" />
              </span>
            </p-button>
          </div>
        </template>
        <template v-else>
          <app-formgroup
            :class="$style.partForm"
            :errors="item.errors"
            :inputs="item.fields"
            :label-prefix="`cv.${name}`"
            :loading="isLoading"
            no-form
          >
            <template #after>
              <div
                v-if="item.errors.entity.length > 0"
                :class="$style.errorContainer"
              >
                <translated-text
                  v-for="err in item.errors.entity"
                  :key="err.message"
                  :trans-key="err.message"
                />
              </div>
            </template>
          </app-formgroup>
        </template>
      </div>

      <div class="mt-3 flex">
        <label class="flex align-items-center">
          <input
            v-model="gdprCheckbox"
            required
            type="checkbox"
          >

          <span class="ml-2">
            <translated-text trans-key="form.cv.gdpr" />
          </span>
        </label>
      </div>

      <div class="mt-3 flex">
        <p-button
          v-if="resume"
          :loading="isLoading"
          class="p-button-danger"
          @click.prevent="handleDelete"
        >
          <i class="pi pi-trash p-button-icon p-button-icon-left" />
          <span class="p-button-label">
            <translated-text trans-key="form.delete" />
          </span>
        </p-button>

        <p-button
          :disabled="!gdprCheckbox"
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
    ref,
    defineComponent,
    reactive,
  } from "vue";
  import Chip from "primevue/chip";
  import {
    keys,
    map,
    mapObject,
    path,
    pipe,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    type MaybeRef,
    type Dict,
  } from "~/helpers/type";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import useTitle from "~/composables/useTitle";
  import {
    resumeCityCreate,
    resumeCvCreate,
    resumeFacultyCreate,
    resumeInterestCreate,
    resumeProjectCreate,
    resumeStudyCreate,
    resumeTechnologyCreate,
    resumeVolunteerExperienceCreate,
    resumeWorkExperienceCreate,
  } from "~/helpers/forms/resume";
  import AppFormgroup, {
    type InputEntry,
  } from "~/components/util/form/app-formgroup.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    type IMutationUpdateResumeArgs,
    type IMyResumeQuery,
    type IMyResumeQueryVariables,
    type ISearchResponseStringArray,
    type IUpdateResumeMutation,
    MyResume,
    UpdateResume,
  } from "~/graphql/schema";
  import {
    createError,
    unref,
    useThrottleFn,
  } from "#imports";
  import AppTime from "~/components/util/app-time.vue";
  import AppAutocomplete from "~/components/util/form/app-autocomplete.vue";

  enum FormFor {
    Faculty = "faculty",
    Technologies = "technologies",
    Interests = "interests",
    StudyYears = "studyYears",
    City = "city",
    WorkExperiences = "workExperiences",
    Projects = "projects",
    VolunteerExperiences = "volunteerExperiences",
    Pdf = "pdf",
  }

  type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[]
      ? ElementType
      : never
  ;

  export default defineComponent({
    name: "PageProfileMeCv",

    components: {
      AppTime,
      AppFormgroup,
      AppUserProfileContainer,
      TranslatedText,
      AppAutocomplete,
      Chip,
    },

    async setup() {
      useTitle("profile.cv");

      const isLoading = ref(false);
      const toast = useToast();

      if ("$WITH_CV" !== process.env.NODE_ENV) {
        throw createError({ statusCode: 404, statusMessage: "Page Not Found" });
      }

      type Resume = NonNullable<IMyResumeQuery["profile"]>["resume"];
      const resumeQuery = () => useQuery<IMyResumeQuery, IMyResumeQueryVariables>({
        query: MyResume,
      })().then((resp) => resp?.data?.profile?.resume);

      const resumeData = await resumeQuery();
      const resume = ref(resumeData);
      const gdprCheckbox = ref(false);

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
      const form =
        <T extends Dict | Dict[]>(fields: Readonly<T>) => ({
          fields,
          errors: (
            // eslint-disable-next-line no-nested-ternary
            fields
              ? (
                Array.isArray(fields)
                  ? map(toErrors, fields)
                  : toErrors(fields)
              )
              : null
          ),
        })
      ;

      const createFormFor = {
        [FormFor.Pdf]: resumeCvCreate,
        [FormFor.Faculty]: resumeFacultyCreate,
        [FormFor.Technologies]: resumeTechnologyCreate,
        [FormFor.Interests]: resumeInterestCreate,
        [FormFor.StudyYears]: resumeStudyCreate,
        [FormFor.City]: resumeCityCreate,
        [FormFor.WorkExperiences]: resumeWorkExperienceCreate,
        [FormFor.Projects]: resumeProjectCreate,
        [FormFor.VolunteerExperiences]: resumeVolunteerExperienceCreate,
      } as const;

      const _f = <T extends Record<FormFor, unknown>>(forms: T) => reactive(forms);

      const createItems = (r: Resume) => _f({
        [FormFor.Pdf]: form(createFormFor[FormFor.Pdf](r?.cv)),
        [FormFor.Faculty]: form(createFormFor[FormFor.Faculty](r?.faculty)),
        [FormFor.StudyYears]: form((r?.studyYears ?? []).map((p) => createFormFor[FormFor.StudyYears](p))),
        [FormFor.WorkExperiences]: form((r?.workExperiences ?? []).map((p) => createFormFor[FormFor.WorkExperiences](p))),
        [FormFor.Projects]: form((r?.projects ?? []).map((p) => createFormFor[FormFor.Projects](p))),
        [FormFor.VolunteerExperiences]: form((r?.volunteerExperiences ?? []).map((p) => createFormFor[FormFor.VolunteerExperiences](p))),
        [FormFor.Technologies]: form(createFormFor[FormFor.Technologies](null)),
        [FormFor.Interests]: form(createFormFor[FormFor.Interests](null)),
        [FormFor.City]: form(createFormFor[FormFor.City](r)),
      } as const);

      const items = createItems(unref(resume));

      type Autocompetable = FormFor.Interests | FormFor.Technologies;

      const _ac = <T>(items: Record<Autocompetable, T>) => reactive(map(
        (item) => ({
          selected: new Set<string>(),
          suggestions: [] as string[],
          lastIndex: -Infinity,
          ...item,
        }),
        items,
      ));

      const withIndex = <Returns>(fn: { (index: number): Returns, }) => {
        let index = 0;

        return () => {
          return fn(index++);
        };
      };

      const infoFor = _ac({
        [FormFor.Interests]: {
          query: withIndex(
            (index) =>
              useQuery<{ resumeInterests: ISearchResponseStringArray, }, { query: MaybeRef<string>, index: MaybeRef<number>, }>({
                query: gql`
                  query ResumeInterests($query: String!, $index: Int!) {
                    resumeInterests(query: $query, index: $index) {
                        entities
                        index
                    }
                  }
                `,
                variables: {
                  query: String((items[FormFor.Interests].fields as Dict<Dict>).name.value || "").trim(),
                  index,
                },
              })().then((resp) => resp?.data?.resumeInterests)
            ,
          ),
          selected: new Set<string>(unref(resume)?.interests ?? []),
        },
        [FormFor.Technologies]: {
          query: withIndex(
            (index) =>
              useQuery<{ resumeTechnologies: ISearchResponseStringArray, }, { query: MaybeRef<string>, index: MaybeRef<number>, }>({
                query: gql`
                  query ResumeTechnologies($query: String!, $index: Int!) {
                    resumeTechnologies(query: $query, index: $index) {
                        entities
                        index
                    }
                  }
                `,
                variables: {
                  query: String((items[FormFor.Technologies].fields as Dict<Dict>).name.value || "").trim(),
                  index,
                },
              })().then((resp) => resp?.data?.resumeTechnologies)
            ,
          ),
          selected: new Set<string>(unref(resume)?.technologies ?? []),
        },
      });

      const toData =
        <T>(info: Record<keyof T, InputEntry>) =>
          pipe(
            (x: Record<keyof T, InputEntry>) => keys(x),
            map((key) => [ key, info[key].value ] as const),
            Object.fromEntries,
          )(info) as Record<keyof T, string>
      ;

      const resetErrors = () => {
        for (const item of Object.values(items)) {
          const { fields } = item;
          // @ts-ignore
          const f = form(fields);
          item.errors = f.errors;
        }
      };

      const resetForm = async () => {
        isLoading.value = true;
        const newResume = await resumeQuery();
        isLoading.value = false;

        resume.value = newResume;

        const newItems = createItems(newResume);

        Object.assign(items, newItems);
        infoFor[FormFor.Interests].selected = new Set<string>(unref(resume)?.interests ?? []);
        infoFor[FormFor.Technologies].selected = new Set<string>(unref(resume)?.technologies ?? []);
      };

      const itemData =
        <Key extends FormFor>(key: Key) => {
          type Items = typeof items;
          type FieldObj = Items[Key]["fields"];
          type Fields = FieldObj extends readonly unknown[] ? ArrayElement<FieldObj> : FieldObj;
          type Returns = Record<keyof Fields, any>;

          const fields = items[key].fields as FieldObj;

          return ({
            [key]: Array.isArray(fields)
              ? fields.map((field) => toData(field as Dict<InputEntry>))
              : toData(fields as Dict<InputEntry>),
          }) as Record<Key, FieldObj extends readonly unknown[] ? Returns[] : Returns>;
        }
      ;

      const updateResume = useMutation<IUpdateResumeMutation, IMutationUpdateResumeArgs>(UpdateResume);

      return {
        infoFor,
        items,
        isLoading,
        FormFor,
        resume,
        gdprCheckbox,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        searchFields: useThrottleFn(async (name: Autocompetable) => {
          const info = infoFor[name];

          const result = await info.query();

          if (!result) {
            info.suggestions = [];
            return;
          }

          if (info.lastIndex >= result.index) {
            info.suggestions = [
              ...info.suggestions,
            ];
            return;
          }

          info.lastIndex = result.index;
          info.suggestions = result.entities.filter((item) => item && !info.selected.has(item));
        }, 350, true),
        onSelected(name: Autocompetable, value: string) {
          if (!value) {
            return false;
          }

          const info = infoFor[name];
          const form = items[name] as unknown as Dict<Dict<Dict<string>>>;

          info.suggestions = [];
          info.selected.add(value);
          form.fields.name.value = "";

          return false;
        },
        async handleFormSubmit() {
          resetErrors();

          const data: IMutationUpdateResumeArgs["info"] = {
            ...itemData(FormFor.Pdf),
            ...itemData(FormFor.Faculty),
            ...itemData(FormFor.WorkExperiences),
            ...itemData(FormFor.Projects),
            ...itemData(FormFor.VolunteerExperiences),
            ...itemData(FormFor.StudyYears),
            [FormFor.Technologies]: Array.from(infoFor[FormFor.Technologies].selected),
            [FormFor.Interests]: Array.from(infoFor[FormFor.Interests].selected),
            [FormFor.City]: itemData(FormFor.City)[FormFor.City].city,
          };

          if ("string" === typeof data[FormFor.Pdf]?.cv) {
            data[FormFor.Pdf].keepOld = "" !== data[FormFor.Pdf]?.cv;
            data[FormFor.Pdf].cv = null;
          }

          for (const item of [
            ...data[FormFor.WorkExperiences] ?? [],
            ...data[FormFor.VolunteerExperiences] ?? [],
            ...data[FormFor.Projects] ?? [],
          ]) {
            if ("" === item.until) {
              item.until = null;
            }
          }

          isLoading.value = true;
          const resp = await updateResume({
            info: data,
          }).then((resp) => resp?.data?.updateResume);
          isLoading.value = false;

          if (resp?.entity?.uid) {
            await resetForm();
            return toast.add({
              severity: "success",
              summary: "Saved",
              closable: true,
              life: 3000,
            });
          }

          if (!resp) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 3000,
            });
          }

          toast.add({
            severity: "warn",
            summary: "Please check your form for errors",
            closable: true,
            life: 3000,
          });

          const errorList =
            resp
              .errors
              ?.map((err) => {
                const [ form, ...rest ] = err.field.split(".");

                err.field = [ form, "errors", ...rest ].join(".");

                return err;
              })
            || []
          ;

          for (const { field, message } of errorList) {
            if ("entity.errors" === field) {
              toast.add({
                severity: "error",
                summary: message,
                closable: true,
                life: 3000,
              });
              continue;
            }

            const errors = path<AuthError[]>(field, items) || [];

            errors.push({
              message,
            });
          }
        },
        noop() {
          return false;
        },
        addPart<T extends FormFor>(name: T) {
          const form = items[name] as unknown as Dict<unknown[]> | undefined;
          const createFields = createFormFor[name] as ((p: null) => unknown) | undefined;

          if (!form || !createFields) {
            return;
          }

          const fields = createFields(null);
          form.fields.push(fields);
          form.errors.push(toErrors(fields));
        },
        removePart<T extends FormFor>(name: T, i: number) {
          const form = items[name] as unknown as Dict<unknown[]> | undefined;

          if (!form) {
            return;
          }

          form.fields.splice(i, 1);
          form.errors.splice(i, 1);
        },
        removeAutocompleted(name: Autocompetable, selection: string) {
          infoFor[name].selected.delete(selection);
        },
        async handleDelete() {
          if (!confirm("Delete?")) {
            return;
          }

          isLoading.value = true;
          const success = await useMutation<{ deleteResume: boolean, }, never>(gql`
          mutation DeleteResume {
            deleteResume
          }
          `)().then((resp) => resp?.data?.deleteResume ?? false);
          isLoading.value = false;

          if (success) {
            return window.location.reload();
          }

          toast.add({
            severity: "error",
            summary: "Something went wrong",
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

  .contents {
    display: contents;
  }

  .container {
    $breakpoint: lg;

    .part {
      padding: 1rem;
      border: 1px solid rgb(0 0 0 / 15%);
      border-radius: 4px;

      > h2 {
        font-size: 2rem;
        margin: 0 0 1.75rem;
        text-align: center;
        color: $fer-black;

        @include media($breakpoint) {
          font-size: 1.45rem;
        }
      }

      .partForm {
        display: grid;
        grid-template-columns: repeat(2, 1fr);

        @include media($breakpoint) {
          grid-template-columns: repeat(1, 1fr);
        }
      }

      .partForm + .partForm {
        $offset: 1.5rem;

        margin-top: $offset;
        padding-top: $offset;
        border-top: 1px solid rgb(0 0 0 / 20%);
      }

      .removeButton {
        align-self: end;
        justify-self: right;
        grid-column: span 2;

        @include media($breakpoint) {
          align-self: end;
          justify-self: center;
          grid-column: inherit;
        }
      }

      .addPart {
        margin-top: 1.5rem;
        text-align: right;

        @include media($breakpoint) {
          text-align: center;
        }
      }
    }

    .part + .part {
      margin-top: 4rem;
    }

    .autocomplete {
      display: grid;
      gap: 1rem;

      .autocompleteInput {
        min-width: 50%;
        margin: 0 auto;

        input {
          flex: 1;
        }
      }

      .autocompleteChips {
        $gap: .5rem;

        margin-top: calc(-1 * #{$gap});
        text-align: center;

        > * {
          margin-top: $gap;
        }

        > * + * {
          margin-left: $gap;
        }
      }
    }
  }
</style>
