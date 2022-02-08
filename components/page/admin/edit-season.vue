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
        :class="$style.errorContainer"
      >
        <translated-text
          v-for="err in errors.entity"
          :key="err.message"
          :trans-key="err.message"
        />
      </div>

      <div class="flex">
        <p-button
          v-if="uid"
          :loading="isLoading"
          class="p-button-danger font-bold mr-auto"
          @click.prevent="handleDelete()"
        >
          <translated-text trans-key="form.delete" />
        </p-button>

        <p-button
          :loading="isLoading"
          class="p-button-secondary font-bold ml-auto"
          type="submit"
        >
          <translated-text trans-key="form.save" />
        </p-button>
      </div>
    </template>
  </app-formgroup>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
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
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    seasonCreate,
  } from "~/helpers/forms/season";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    ISeason,
    ISeasonCreateInput,
    ISeasonUpdateInput,
  } from "~/graphql/schema";
  import {
    useMutation,
  } from "~/composables/useQuery";

  export default defineComponent({
    components: {
      TranslatedText,
      AppFormgroup,
    },

    props: {
      season: {
        required: false,
        type: [ Object ],
        default: () => undefined,
      },

      uid: {
        required: false,
        type: [ String ],
        default: () => "",
      },
    },

    emits: [
      "save",
      "delete",
    ],

    setup(
      props,
      {
        emit,
      },
    ) {
      const toDatetimeString =
        (date: ConstructorParameters<typeof Date>[0]) => {
          const zeroPad = (i: number) => i.toString().padStart(2, "0");

          const d = new Date(date);
          const YYYY = d.getFullYear();
          const MM = zeroPad(d.getMonth() + 1);
          const DD = zeroPad(d.getDate());
          const HH = zeroPad(d.getHours());
          const II = zeroPad(d.getMinutes());
          const SS = zeroPad(d.getSeconds());

          return `${ YYYY }-${ MM }-${ DD }T${ HH }:${ II }:${ SS }`;
        }
      ;

      const createObj = () => mapObject(
        (x) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
          "datetime-local" === x.type
            ? {
              ...x,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
              value: toDatetimeString(x.value),
            }
            : x
        ,
        seasonCreate(props.season as ISeason),
      );

      const info = reactive({
        ...createObj(),
      });
      const resetInfo =
        () =>
          toPairs(createObj())
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
            .forEach(([ key, { value } ]) => info[key].value = value)
      ;

      const isLoading = ref(false);

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);


      const handleSave = useMutation<{
                                       createSeason: ISeason,
                                     },
                                     {
                                       info: ISeasonCreateInput,
                                     }>(gql`
        mutation CreateSeason($info: SeasonCreateInput!) {
          createSeason(info: $info) {
            uid
            name
            startsAt
            endsAt
          }
        }
      `);

      const handleUpdate = useMutation<{
                                         updateSeason: ISeason,
                                       },
                                       {
                                         info: ISeasonUpdateInput,
                                       }>(gql`
        mutation UpdateSeason($info: SeasonUpdateInput!) {
          updateSeason(info: $info) {
            uid
            name
            startsAt
            endsAt
          }
        }
      `);

      const handleDelete = useMutation<{
                                         deleteSeason: ISeason,
                                       },
                                       {
                                         uid: string,
                                       }>(gql`
        mutation UpdateSeason($uid: String!) {
          deleteSeason(uid: $uid) {
            uid
            name
            startsAt
            endsAt
          }
        }
      `);

      return {
        isLoading,
        info,
        errors,
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
          const resp = await (
            props.uid
              ? handleUpdate
              : handleSave
          )({
            info: {
              ...data,
              uid: props.uid || undefined,
            },
          });
          isLoading.value = false;

          if (!resp?.data) {
            return alert("Something went wrong");
          }

          const season =
            "createSeason" in resp.data
              ? resp.data.createSeason
              : resp.data.updateSeason
          ;

          if (!props.uid) {
            resetInfo();
          }

          emit("save", season);
        },
        async handleDelete() {
          if (!window.confirm(`Delete ${ (props.season as { name: string, }).name }?`)) {
            return;
          }

          isLoading.value = true;
          const resp = await handleDelete({
            uid: props.uid,
          });
          isLoading.value = false;

          if (!resp?.data) {
            return alert("Something went wrong");
          }

          emit("delete", resp.data.deleteSeason);
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .form {
    gap: 1rem;
  }
</style>
