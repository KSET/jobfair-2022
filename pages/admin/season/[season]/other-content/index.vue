
<template>
  <app-max-width-container :class="$style.container">
    <h1>Other Content za {{ season?.name }}</h1>

    <div>
      <nuxt-link :to="{ name: 'admin', hash: `#season-${ season?.uid }` }">
        &larr; Natrag
      </nuxt-link>
    </div>

    <fieldset
      v-for="item in items"
      :key="item.uid"
    >
      <legend>
        <strong>
          <em>[{{ item.form.nameHr.value }}]</em>
        </strong>
      </legend>

      <app-formgroup
        :errors="item.errors"
        :inputs="item.form"
        :loading="isLoading"
        :class="$style.form"
        label-prefix="other-content"
        @submit="handleSubmit(item)"
      >
        <template #after>
          <div :class="$style.participantsSection">
            <h4>Sudionici</h4>
            <div
              v-for="(pForm, pIdx) in item.participantForms"
              :key="pIdx"
              :class="$style.participantCard"
            >
              <app-formgroup
                :errors="pForm.errors"
                :inputs="pForm.form"
                :loading="isLoading"
                :class="$style.presenterForm"
                label-prefix="other-content-presenter"
                no-form
              />
              <div>
                <p-button
                  class="p-button-danger p-button-sm"
                  :disabled="isLoading"
                  @click.prevent="item.participantForms.splice(pIdx, 1)"
                >
                  <i class="pi pi-trash" />
                </p-button>
              </div>
            </div>
            <div class="flex mt-2">
              <p-button
                class="p-button-secondary ml-auto"
                :disabled="isLoading"
                @click.prevent="addParticipant(item)"
              >
                <span class="p-button-label">Dodaj sudionika</span>
              </p-button>
            </div>
          </div>

          <div class="flex">
            <p-button
              class="p-button-danger"
              :disabled="isLoading"
              @click.prevent="handleDelete(item)"
            >
              <i class="pi pi-trash p-button-icon p-button-icon-left" />
              <span class="p-button-label">Delete</span>
            </p-button>
            <p-button
              class="ml-auto"
              :loading="isLoading"
              type="submit"
            >
              <span class="p-button-label">Save</span>
            </p-button>
          </div>
        </template>
      </app-formgroup>
    </fieldset>

    <fieldset>
      <legend>
        <strong>
          <em>[New]</em>
        </strong>
      </legend>

      <app-formgroup
        :errors="newErrors"
        :inputs="newForm"
        :loading="isLoading"
        :class="$style.form"
        label-prefix="other-content"
        @submit="handleCreate"
      >
        <template #after>
          <div class="flex">
            <p-button
              class="ml-auto"
              :loading="isLoading"
              :disabled="isLoading || !(newForm.nameHr.value as string).trim() || !(newForm.nameEn.value as string).trim()"
              type="submit"
            >
              <span class="p-button-label">Add</span>
            </p-button>
          </div>
        </template>
      </app-formgroup>
    </fieldset>
  </app-max-width-container>
</template>

<script lang="ts">
  import Button from "primevue/button";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    gql,
  } from "@urql/core";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    defineComponent,
    ref,
    reactive,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    useQuery,
    useMutation,
  } from "~/composables/useQuery";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    otherContentCreate,
    otherContentPresenterCreate,
    type OtherContentFormData,
    type OtherContentPresenterFormData,
  } from "~/helpers/forms/other-content";
  import {
    type InputEntry,
  } from "~/components/util/form/app-formgroup.types";
  type AuthError = { message: string, };
  type FormErrors<T> = Record<keyof T | "entity", AuthError[]>;

  type ParticipantFormEntry = {
    form: ReturnType<typeof otherContentPresenterCreate>,
    errors: FormErrors<OtherContentPresenterFormData>,
    existingPhotoUid: string | null,
  };

  type OtherContentItem = {
    uid: string,
    form: ReturnType<typeof otherContentCreate>,
    errors: FormErrors<OtherContentFormData>,
    participantForms: ParticipantFormEntry[],
  };

  type OtherContentParticipant = {
    firstName: string,
    lastName: string,
    bioEn: string,
    bioHr: string,
    photo: { uid: string, name: string, full: { mimeType: string, }, } | null,
  };

  type OtherContentRaw = {
    uid: string,
    nameHr: string,
    nameEn: string,
    descriptionHr: string,
    descriptionEn: string,
    subtype: string,
    participants: OtherContentParticipant[],
  };

  const makeItemErrors = (form: ReturnType<typeof otherContentCreate>) =>
    mapObject(() => [] as AuthError[], { ...form, entity: "" }) as FormErrors<OtherContentFormData>
  ;

  const makePresenterErrors = (form: ReturnType<typeof otherContentPresenterCreate>) =>
    mapObject(() => [] as AuthError[], { ...form, entity: "" }) as FormErrors<OtherContentPresenterFormData>
  ;

  const makeParticipantEntry = (p?: OtherContentParticipant | null): ParticipantFormEntry => {
    const form = reactive(otherContentPresenterCreate(p ? { ...p } : null));
    return {
      form,
      errors: reactive(makePresenterErrors(form)),
      existingPhotoUid: p?.photo?.uid ?? null,
    };
  };

  const makeItem = (raw: OtherContentRaw): OtherContentItem => {
    const form = reactive(otherContentCreate(raw));
    return {
      uid: raw.uid,
      form,
      errors: reactive(makeItemErrors(form)),
      participantForms: (raw.participants ?? []).map(makeParticipantEntry),
    };
  };

  const OtherContentListQuery = gql`
    query OtherContentList($season: String) {
      otherContents(season: $season) {
        uid
        nameHr
        nameEn
        descriptionHr
        descriptionEn
        subtype
        participants {
          firstName
          lastName
          bioEn
          bioHr
          photo { uid name full { mimeType } }
        }
      }
    }
  `;

  const UpdateOtherContentMutation = gql`
    mutation UpdateOtherContent($input: OtherContentUpdateInput!) {
      updateOtherContent(input: $input) {
        uid
        nameHr
        nameEn
        descriptionHr
        descriptionEn
        subtype
        participants {
          firstName
          lastName
          bioEn
          bioHr
          photo { uid name full { mimeType } }
        }
      }
    }
  `;

  const DeleteOtherContentMutation = gql`
    mutation DeleteOtherContent($uid: String!) {
      deleteOtherContent(uid: $uid)
    }
  `;

  export default defineComponent({
    name: "PageAdminSeasonOtherContent",

    components: {
      AppMaxWidthContainer,
      AppFormgroup,
      PButton: Button,
    },

    async setup() {
      const seasonsStore = useSeasonsStore();
      const toast = useToast();
      const isLoading = ref(false);

      const newForm = reactive(otherContentCreate(null));
      const newErrors = reactive(makeItemErrors(newForm));

      const items = ref<OtherContentItem[]>([]);

      const fetchItems = async () => {
        const resp = await useQuery<{ otherContents: OtherContentRaw[], }, { season: string | null | undefined, }>({
          query: OtherContentListQuery,
          variables: {
            season: seasonsStore.season?.uid,
          },
        })().then((res) => res?.data?.otherContents ?? []);
        items.value = resp.map(makeItem) as unknown as OtherContentItem[];
      };

      await fetchItems();

      const toData = <T>(form: Record<keyof T, InputEntry>) =>
        pipe(
          (x: Record<keyof T, InputEntry>) => keys(x),
          map((key) => [ key, (form[key] as { value: unknown, }).value ]),
          Object.fromEntries,
        )(form) as Record<keyof T, unknown>
      ;

      const extractParticipants = (item: OtherContentItem) =>
        item.participantForms.map((p) => {
          const data = toData<OtherContentPresenterFormData>(p.form);
          if ("string" === typeof data.photo) {
            delete data.photo;
            return { ...data, existingPhotoUid: p.existingPhotoUid ?? null };
          }
          return { ...data, existingPhotoUid: null };
        })
      ;

      return {
        season: seasonsStore.season,
        items,
        isLoading,
        newForm,
        newErrors,

        addParticipant(item: OtherContentItem) {
          item.participantForms.push(makeParticipantEntry(null));
        },

        async handleSubmit(item: OtherContentItem) {
          isLoading.value = true;
          const data = toData<OtherContentFormData>(item.form);
          const participants = extractParticipants(item);
          const resp = await useMutation<{ updateOtherContent: OtherContentRaw | null, }, { input: OtherContentRaw & { season: string, }, }>(UpdateOtherContentMutation)({
            input: {
              ...data,
              uid: item.uid,
              season: seasonsStore.season?.uid ?? "",
              participants,
            } as OtherContentRaw & { season: string, },
          }).then((res) => res?.data?.updateOtherContent ?? null);

          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri spremanju. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await fetchItems();
          }
          isLoading.value = false;
        },

        async handleDelete(item: OtherContentItem) {
          if (!window.confirm(`Obriši "${ String(item.form.nameHr.value) }"?`)) {
            return;
          }

          isLoading.value = true;
          const ok = await useMutation<{ deleteOtherContent: boolean, }, { uid: string, }>(DeleteOtherContentMutation)({
            uid: item.uid,
          }).then((res) => res?.data?.deleteOtherContent ?? false);

          if (!ok) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri brisanju. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await fetchItems();
          }
          isLoading.value = false;
        },

        async handleCreate() {
          if (!(newForm.nameHr.value as string).trim() || !(newForm.nameEn.value as string).trim()) {
            return;
          }

          isLoading.value = true;
          const data = toData<OtherContentFormData>(newForm);
          const resp = await useMutation<{ updateOtherContent: OtherContentRaw | null, }, { input: Omit<OtherContentRaw, "uid"> & { uid: null, season: string, }, }>(UpdateOtherContentMutation)({
            input: {
              ...data,
              uid: null,
              season: seasonsStore.season?.uid ?? "",
              participants: [],
            } as Omit<OtherContentRaw, "uid"> & { uid: null, season: string, },
          }).then((res) => res?.data?.updateOtherContent ?? null);

          if (!resp) {
            toast.add({
              severity: "error",
              summary: "Greška",
              detail: "Greška pri spremanju. Pokušajte ponovo.",
              life: 3000,
            });
          } else {
            await fetchItems();
            const fresh = otherContentCreate(null);
            keys(newForm).forEach((k) => {
              (newForm[k] as { value: unknown, }).value = (fresh[k] as { value: unknown, }).value;
            });
          }
          isLoading.value = false;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    fieldset + fieldset {
      margin-top: 1rem;
    }

    fieldset {
      border-radius: 4px;
    }
  }

  .form,
  .presenterForm {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    > * {
      grid-column: span 2;
    }

    > :global(.span-1) {
      grid-column: span 1;
    }

    @include media(md) {
      grid-template-columns: repeat(1, minmax(0, 1fr));

      > :global(.span-1) {
        grid-column: span 1;
      }
    }
  }

  .participantsSection {
    margin-top: 1rem;
    margin-bottom: 1rem;

    h4 {
      margin-bottom: 0.5rem;
    }
  }

  .participantCard {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #{$fer-dark-blue};
    border-radius: 4px;

    & + & {
      margin-top: 0.75rem;
    }

    > :first-child {
      flex: 1;
    }
  }
</style>
