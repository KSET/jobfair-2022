<template>
  <div>
    <app-formgroup
      :errors="errors"
      :inputs="info"
      :loading="isLoading"
      class="flex"
      label-prefix="company-panel"
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
            :loading="isLoading"
            class="ml-auto"
            type="submit"
          >
            <span class="p-button-label">Save</span>
          </p-button>
        </div>
      </template>
    </app-formgroup>

    <EditScheduleItemFor
      v-if="itemInfo && itemInfo.uid"
      v-model:item="itemInfo.event"
      :for-uid="itemInfo.uid"
      :grouped="false"
      :season="season"
      class="mt-4"
      type="panel"
    />
  </div>
</template>

<script lang="ts">
  import type {
    WritableComputedRef,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    gql,
  } from "@urql/core";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    defineComponent,
    reactive,
    ref,
    unref,
    useModelWrapper,
    useMutation,
  } from "#imports";
  import {
    ICompany,
    ICompanyPanel,
    ICompanyPanelUpdateInput,
    IMutationUpdateCompanyPanelArgs,
  } from "~/graphql/schema";
  import {
    companyPanelListCreate,
  } from "~/helpers/forms/company";
  import EditScheduleItemFor from "~/components/page/admin/season/[season]/schedule/edit-schedule-item-for.vue";

  export default defineComponent({
    components: {
      EditScheduleItemFor,
      AppFormgroup,
    },

    props: {
      season: {
        type: String,
        required: true,
      },
      item: {
        type: Object,
        required: false,
        default: null,
      },
      panelists: {
        type: Array,
        required: false,
        default: () => [],
      },
    },

    setup(props, { emit }) {
      type CompanyPanel = Pick<ICompanyPanel, "uid" | "name"> & { companies: Pick<ICompany, "uid">[], };

      const itemInfo: WritableComputedRef<CompanyPanel | null> = useModelWrapper(props, emit)("item");
      const formModel = reactive(companyPanelListCreate(unref(itemInfo))(props.panelists as any[]));

      const isLoading = ref(false);

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...formModel,
        entity: "",
      }) as Record<keyof typeof formModel | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const updateQuery = useMutation<{ updateCompanyPanel: CompanyPanel, }, IMutationUpdateCompanyPanelArgs>(gql`
        mutation Update($input: CompanyPanelUpdateInput!) {
          updateCompanyPanel(input: $input) {
            uid
            name
            description
            companies {
              uid
            }
            event {
              uid
              type
              title
              start
              end
              location
              text
              grouped
            }
          }
        }
      `);

      const deleteQuery = useMutation<{ deleteCompanyPanel: boolean, }, { uid: string, }>(gql`
        mutation Delete($uid: String!) {
          deleteCompanyPanel(uid: $uid)
        }
      `);

      return {
        itemInfo,
        info: formModel,
        errors,
        isLoading,
        async handleSubmit() {
          resetErrors();
          const data: ICompanyPanelUpdateInput = {
            ...pipe(
              (x: typeof formModel) => keys(x),
              map((key) => [
                key,
                "datetime-local" === (formModel[key] as { type: string, }).type
                  ? new Date((formModel[key] as { value: string, }).value)
                  : (formModel[key] as { value: unknown, }).value,
              ]),
              Object.fromEntries,
            )(formModel),
            season: props.season,
            uid: props.item?.uid,
          };

          isLoading.value = true;
          const resp = await updateQuery({
            input: data,
          }).then((resp) => resp?.data?.updateCompanyPanel);
          isLoading.value = false;

          const newUid = resp?.uid;

          if (!newUid) {
            return alert("Something went wrong");
          }

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

          if (!resp?.data?.deleteCompanyPanel) {
            return alert("Something went wrong");
          }

          itemInfo.value = null;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .submitButton {
    align-self: end;
  }
</style>
