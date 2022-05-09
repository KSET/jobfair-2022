<template>
  <app-formgroup
    :class="$style.formGroup"
    :errors="errors"
    :inputs="formModel"
    :loading="loading || isLoading"
    label-prefix="schedule-item"
    @submit="handleSubmit"
  >
    <template #after>
      <div class="flex">
        <p-button
          v-if="item && item.uid"
          :class="$style.submitButton"
          class="p-button-danger"
          @click.prevent="handleDelete"
        >
          <i class="pi pi-trash p-button-icon p-button-icon-left" />
          <span class="p-button-label">Delete</span>
        </p-button>

        <p-button
          :class="$style.submitButton"
          :loading="loading || isLoading"
          class="ml-auto"
          type="submit"
        >
          <span class="p-button-label">Save</span>
        </p-button>
      </div>
    </template>
  </app-formgroup>
</template>

<script lang="ts">
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import type {
    WritableComputedRef,
  } from "vue";
  import {
    defineComponent,
    reactive,
    ref,
    unref,
    useModelWrapper,
    useMutation,
  } from "#imports";
  import {
    calendarItemCreate,
    calendarItemForEntityCreate,
  } from "~/helpers/forms/calendar";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import type {
    ICalendarItem,
    ICalendarUpdateInput,
    IMutationUpdateCalendarItemArgs,
  } from "~/graphql/schema";
  import {
    Dict,
  } from "~/helpers/type";

  export default defineComponent({
    components: {
      AppFormgroup,
    },

    props: {
      item: {
        type: Object,
        required: false,
        default: null,
      },
      season: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: false,
        default: "",
      },
      grouped: {
        type: Boolean,
        required: false,
        default: null,
      },
      forUid: {
        type: String,
        required: false,
        default: "",
      },
      loading: {
        type: Boolean,
        required: false,
        default: false,
      },
    },

    emits: [
      "submit",
      "delete",
      "update:item",
    ],

    setup(props, { emit }) {
      const itemInfo: WritableComputedRef<ICalendarItem | null> = useModelWrapper(props, emit)("item");
      const formModel = reactive((props.type && props.forUid) ? calendarItemForEntityCreate(unref(itemInfo)) : calendarItemCreate(unref(itemInfo)));

      const isLoading = ref(false);

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...formModel,
        entity: "",
      }) as Record<keyof typeof formModel | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const updateQuery = useMutation<{ updateCalendarItem: Pick<ICalendarItem, "uid" | "title" | "start" | "end" | "location" | "text" | "grouped">, }, IMutationUpdateCalendarItemArgs>(gql`
        mutation UpdateCalendarItem($input: CalendarUpdateInput!) {
          updateCalendarItem(input: $input) {
            uid
            title
            type
            start
            end
            location
            text
            grouped
          }
        }
      `);

      const deleteQuery = useMutation<{ deleteCalendarItem: boolean, }, { uid: string, }>(gql`
        mutation DeleteCalendarItem($uid: String!) {
          deleteCalendarItem(uid: $uid)
        }
      `);

      return {
        itemInfo,
        formModel,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          const formData = pipe(
            (x: typeof formModel) => keys(x),
            map((key) => [
              key,
              "datetime-local" === (formModel[key] as { type: string, }).type
                ? new Date((formModel[key] as { value: string, }).value)
                : (formModel[key] as { value: unknown, }).value,
            ]),
            Object.fromEntries,
          )(formModel);

          const data: ICalendarUpdateInput = {
            ...formData,
            uid: props.item?.uid,
            forUid: props.forUid,
            type: props.type || (formData as Dict<string>).type,
            grouped: props.grouped ?? (formData as Dict<boolean>).grouped,
            season: props.season,
          };

          isLoading.value = true;
          const resp = await updateQuery({
            input: data,
          }).then((resp) => resp?.data?.updateCalendarItem);
          isLoading.value = false;

          const newUid = resp?.uid;

          if (!newUid) {
            return alert("Something went wrong");
          }

          emit("submit", resp);

          itemInfo.value = resp;
        },
        async handleDelete() {
          const { uid } = unref(itemInfo) || {};

          if (!uid) {
            return;
          }

          if (!confirm("Are you sure?")) {
            return;
          }

          isLoading.value = true;
          const resp = await deleteQuery({
            uid,
          });
          isLoading.value = false;

          if (!resp?.data?.deleteCalendarItem) {
            return alert("Something went wrong");
          }

          emit("delete", uid);

          itemInfo.value = null;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .formGroup {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    @include media(md) {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  .submitButton {
    align-self: end;
  }
</style>
