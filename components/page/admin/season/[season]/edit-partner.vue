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
          v-if="partner"
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
    partnerCreate,
  } from "~/helpers/forms/partner";
  import {
    useMutation,
  } from "~/composables/useQuery";
  import {
    ICreatePartnerResponse,
    IMutationCreatePartnerArgs,
    IMutationDeletePartnerArgs,
    IPartner,
  } from "~/graphql/schema";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";

  export default defineComponent({
    name: "EditPartner",

    components: {
      TranslatedText,
      AppFormgroup,
    },

    props: {
      partner: {
        required: false,
        type: Object as PropType<IPartner>,
        default: () => undefined as (IPartner | undefined),
      },

      seasonUid: {
        required: true,
        type: String,
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
      const {
        partner,
      } = props;

      const info = reactive(partnerCreate(partner));
      const resetInfo =
        () =>
          toPairs(partnerCreate())
            .forEach(([ key, { value } ]) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
              info[key].value = value;
            })
      ;

      /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions */
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

      if (partner) {
        for (const item of Object.values(info)) {
          item.disabled = true;
        }
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions */

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      type QData = {
        createPartner: ICreatePartnerResponse,
      };
      const handleSave = useMutation<QData, IMutationCreatePartnerArgs>(gql`
        mutation CreatePartner($season: String!, $info: PartnerCreateInput!) {
          createPartner(season: $season, info: $info) {
            entity {
              uid
              name
              url
              photo {
                uid
                full {
                  mimeType
                }
              }
            }
            errors {
              message
              field
            }
          }
        }
      `);
      const handleDelete = useMutation<boolean, IMutationDeletePartnerArgs>(gql`
        mutation DeletePartner($partner: String!) {
          deletePartner(partner: $partner)
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
            season: props.seasonUid,
            info: data,
          }).then((resp) => resp?.data || null);
          isLoading.value = false;

          if (resp?.createPartner?.errors) {
            return alert("Something went wrong. Please try again.");
          }

          if (!resp?.createPartner?.entity) {
            return toast.add({
              severity: "error",
              summary: "Something went wrong",
              closable: true,
              life: 5000,
            });
          }

          resetInfo();

          emit("save", resp.createPartner.entity);
        },

        async handleDelete() {
          if (!partner) {
            return;
          }

          if (!confirm(`Are you sure you want to delete \`${ partner.name }\`?`)) {
            return;
          }

          isLoading.value = true;
          const resp = await handleDelete({
            partner: partner.uid,
          });
          isLoading.value = false;

          if (resp?.data) {
            return emit("delete", partner);
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
    row-gap: .5em;

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
