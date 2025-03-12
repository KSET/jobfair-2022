<template>
  <app-formgroup
    :class="$style.form"
    :errors="errors"
    :inputs="info"
    :loading="isLoading"
    @submit="handleSubmit"
  >
    <template #after>
      <div
        v-if="errors.entity.length > 0"
      >
        <translated-text
          v-for="err in errors.entity"
          :key="err.message"
          :trans-key="err.message"
        />
      </div>

      <div :class="[$style.actions, $style.span2]">
        <template
          v-if="galleryImage"
        >
          <div :class="$style.arrows">
            <p-button
              :class="$style.arrow"
              :disabled="isFirst"
              :loading="isLoading"
              icon="pi pi-arrow-left"
              @click.prevent="$emit('move', 'left')"
            />
            <p-button
              :class="$style.arrow"
              :disabled="isLast"
              :loading="isLoading"
              icon="pi pi-arrow-right"
              @click.prevent="$emit('move', 'right')"
            />
          </div>

          <p-button
            :loading="isLoading"
            class="p-button-danger font-bold ml-auto"
            @click.prevent="handleDelete"
          >
            <i class="pi pi-trash mr-2" />
            <translated-text trans-key="form.delete" />
          </p-button>
          <p-button
            :loading="isLoading"
            class="p-button-secondary font-bold ml-auto"
            @click.prevent="handleEdit"
          >
            <translated-text trans-key="form.save" />
          </p-button>
        </template>
        <template
          v-else
        >
          <p-button
            :loading="isLoading"
            class="p-button-secondary font-bold ml-auto"
            type="submit"
          >
            <translated-text trans-key="form.save" />
          </p-button>
        </template>
      </div>
    </template>
  </app-formgroup>
</template>

<script lang="ts">
  import type {
    PropType,
  } from "vue";
  import {
    defineComponent,
    reactive,
    ref,
    useCssModule,
    computed,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
    toPairs,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    galleryImageCreate,
  } from "~/helpers/forms/galleryImage";
  import {
    useMutation,
  } from "~/composables/useQuery";
  import {
    CreateGalleryImage,
    EditGalleryImage,
    type ICreateGalleryImageMutation,
    type ICreateGalleryImageMutationVariables,
    type IEditGalleryImageMutation,
    type IEditGalleryImageMutationVariables,
    type IGalleryImage,
    type IMutationDeleteGalleryImageArgs,
  } from "~/graphql/schema";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    toRef,
  } from "#imports";

  export default defineComponent({
    name: "EditGalleryImage",

    components: {
      TranslatedText,
      AppFormgroup,
    },

    props: {
      galleryImage: {
        required: false,
        type: Object as PropType<IGalleryImage>,
        default: () => undefined as (IGalleryImage | undefined),
      },

      loading: {
        required: false,
        type: Boolean,
        default: false,
      },

      isFirst: {
        required: false,
        type: Boolean,
        default: false,
      },

      isLast: {
        required: false,
        type: Boolean,
        default: false,
      },
    },

    emits: [
      "save",
      "edit",
      "delete",
      "move",
    ],

    setup(
      props,
      {
        emit,
      },
    ) {
      const toast = useToast();
      const $style = useCssModule();

      const isLoading = ref(false);
      const galleryImage = toRef(props, "galleryImage");

      const info = reactive(galleryImageCreate(galleryImage.value));
      const resetInfo =
        () =>
          toPairs(galleryImageCreate())
            .forEach(([ key, { value } ]) => {
              info[key].value = value;
            })
      ;

      if (!info.photo?.classes) {
        info.photo.classes = [];
      }

      if (Array.isArray(info.photo.classes)) {
        info.photo.classes.push({
          [$style.span2]: true,
        });
      } else if ("string" === typeof info.photo.classes) {
        info.photo.classes = `${ info.photo.classes } ${ $style.span2 }`;
      } else {
        info.photo.classes[$style.span2] = true;
      }

      if (galleryImage.value) {
        for (const item of Object.values(info)) {
          if ("file" === item.type) {
            item.disabled = true;
          }
        }
      }

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const handleSave = useMutation<ICreateGalleryImageMutation, ICreateGalleryImageMutationVariables>(CreateGalleryImage);

      const handleEditMutation = useMutation<IEditGalleryImageMutation, IEditGalleryImageMutationVariables>(EditGalleryImage);

      const handleDelete = useMutation<boolean, IMutationDeleteGalleryImageArgs>(gql`
        mutation DeleteGalleryImage($uid: String!) {
          deleteGalleryImage(uid: $uid)
        }
      `);

      return {
        isLoading: computed(() => props.loading || isLoading.value),
        errors,
        info,
        async handleSubmit() {
          resetErrors();
          const data = pipe(
            (x: typeof info) => keys(x),
            map((key) => [
              key,
              "datetime-local" === (info[key] as { type: string, }).type
                ? new Date((info[key] as { value: string, }).value)
                : (info[key] as { value: unknown, }).value,
            ]),
            Object.fromEntries,
          )(info);

          isLoading.value = true;
          const resp = await handleSave({
            info: data,
          }).then((resp) => resp?.data || null);
          isLoading.value = false;

          if (resp?.createGalleryImage?.errors) {
            return alert("Something went wrong. Please try again.");
          }

          if (!resp?.createGalleryImage?.entity) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 5000,
            });
          }

          resetInfo();

          emit("save", resp.createGalleryImage.entity);
        },

        async handleEdit() {
          resetErrors();

          isLoading.value = true;

          const data: IEditGalleryImageMutationVariables["info"] = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          if ("string" === typeof data.photo) {
            delete data.photo;
          }

          const resp = await handleEditMutation({
            uid: galleryImage.value.uid,
            info: data,
          }).then((resp) => resp?.data?.editGalleryImage);

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
              summary: "Saved",
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

          resetInfo();

          emit("edit", resp.entity);
        },

        async handleDelete() {
          if (!galleryImage.value) {
            return;
          }

          if (!confirm(`Are you sure you want to delete \`${ galleryImage.value.name }\`?`)) {
            return;
          }

          isLoading.value = true;
          const resp = await handleDelete({
            uid: galleryImage.value.uid,
          });
          isLoading.value = false;

          if (resp?.data) {
            return emit("delete", galleryImage.value);
          }

          alert("Something went wrong. Please try again.");
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .form {
    display: grid;
    align-items: end;
    padding: 1rem;
    vertical-align: middle;
    border: 1px solid #{$fer-dark-blue};
    border-radius: 4px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-self: center;

    @include media(md) {
      grid-auto-flow: row;
      grid-template-columns: minmax(0, 1fr);
    }

    label[for^="input-"][for$="-photo"] {

      & > span > span {
        max-width: 5rem;
      }
    }
  }

  .actions {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    justify-self: stretch;
    gap: .5em;

    > * {
      flex: 1 0 auto;
    }
  }

  .span2 {
    grid-column: span 2;

    @include media(md) {
      grid-column: 1;
    }
  }

  .arrows {
    display: flex;
    align-self: center;
    justify-content: center;
    gap: .5em;

    .arrow {
      width: fit-content;
      padding: .5rem;
    }
  }
</style>
