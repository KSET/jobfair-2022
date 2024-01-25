<template>
  <app-max-width-container :class="$style.container" :not-found="!userExists">
    <h1>Edit user</h1>

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

        <div class="flex -mt-3">
          <NuxtLink :to="{ name: 'admin-users' }">
            <p-button>Cancel</p-button>
          </NuxtLink>

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

    <h2>Reset password</h2>
    <div class="flex">
      <p-button
        :loading="isLoading || isResetPasswordLoading"
        class="p-button-secondary font-bold ml-auto"
        @click="handleSendPasswordReset"
      >
        Send password reset email
      </p-button>
    </div>

    <h2>Sessions</h2>
    <div class="flex flex-column">
      <div v-for="session in sessions" :key="session.sessionId">
        <pre style="white-space: pre-wrap" v-text="session" />
      </div>
    </div>

    <h2>Event log</h2>
    <DataTable
      ref="dt"
      v-model:filters="filters"
      :class="$style.table"
      :rows="20"
      :rows-per-page-options="[2,5,10,20,50,100]"
      :value="eventLog"
      data-key="realId"
      paginator
      paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      removable-sort
      responsive-layout="scroll"
      row-hover
      striped-rows
    >
      <template #header>
        <div :class="$style.tableHeader">
          <p-button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />

          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Pretraži event log" />
          </span>
        </div>
      </template>
      <Column :sortable="true" field="id" header="#" header-style="width: 6em">
        <template #body="{ data }">
          <pre :data-id="data.realId" v-text="data.id" />
        </template>
      </Column>
      <Column :sortable="true" field="name" header="Ime eventa">
        <template #body="{ data }">
          <pre v-text="data.name" />
        </template>
      </Column>
      <Column :sortable="true" field="date" header="Datum">
        <template #body="{ data }">
          {{ data.date.toLocaleString() }}
        </template>
      </Column>
      <Column :sortable="true" field="data" header="Podatci">
        <template #body="{ data }">
          <pre :class="$style.dataContainer">
            <AppJsonViewer
              :json="data.data"
              json-is-raw
              expanded
            />
          </pre>
        </template>
      </Column>
    </DataTable>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    useRoute,
    useRouter,
  } from "vue-router";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import DataTable from "primevue/datatable";
  import Column from "primevue/column";
  import {
    FilterMatchMode,
    FilterService,
  } from "primevue/api";
  import InputText from "primevue/inputtext";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    type IPageAdminUserEditBaseQuery,
    type IPageAdminUserEditBaseQueryVariables,
    type IRequestPasswordResetForMutation,
    type IRequestPasswordResetForMutationVariables,
    type IUpdateUserMutation,
    type IUpdateUserMutationVariables,
    PageAdminUserEditBase,
    RequestPasswordResetFor,
    UpdateUser,
  } from "~/graphql/schema";
  import TranslatedText from "~/components/TranslatedText.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import {
    userEdit,
  } from "~/helpers/forms/user";
  import {
    unref,
  } from "#imports";
  import AppJsonViewer from "~/components/util/app-json-viewer.vue";

  export default defineComponent({
    name: "PageAdminUserEdit",

    components: {
      AppJsonViewer,
      AppFormgroup,
      TranslatedText,
      AppMaxWidthContainer,
      InputText,
      DataTable,
      Column,
    },

    async setup() {
      const $route = useRoute();
      const $router = useRouter();
      const toast = useToast();

      const uid = $route.params.uid as string;

      const resp = await useQuery<IPageAdminUserEditBaseQuery, IPageAdminUserEditBaseQueryVariables>({
        query: PageAdminUserEditBase,
        variables: {
          uid,
        },
      })();

      const eventLog =
        resp
          ?.data
          ?.user
          ?.eventLog
          .map((x, i) => ({
            ...x,
            id: i + 1,
            realId: x.id,
            date: new Date(x.date as string),
          }))
          .sort((lt, gt) => Number(gt.date) - Number(lt.date))
        ?? []
      ;

      const isLoading = ref(false);
      const isResetPasswordLoading = ref(false);

      const info_ = userEdit(resp?.data?.user as never)(resp?.data?.roles ?? []);
      const info = reactive({
        ...info_,
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const dt = ref<DataTable | null>(null);

      const filters_ = <T extends keyof typeof eventLog[number] | "global">(x: Record<T, unknown>) => ref(x);
      const filters = filters_({
        global: { value: null as string | null, matchMode: "$global" },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        data: { value: null, matchMode: FilterMatchMode.CONTAINS },
        date: { value: null, matchMode: FilterMatchMode.DATE_IS },
      });

      FilterService.register("$global", (value: unknown, filter: string | null | undefined) => {
        if (filter === undefined || null === filter || "" === filter.trim()) {
          return true;
        }

        const lowerFilter = filter.toLocaleLowerCase().trim();

        if ("string" === typeof value) {
          return value.toLocaleLowerCase().includes(lowerFilter);
        }

        return false;
      });

      const sessions =
        resp
          ?.data
          ?.sessionsFor
          ?.map(
            (x) => ({
              ...x,
              loggedInAt: new Date(x.loggedInAt),
            })
            ,
          )
        ?? []
      ;

      return {
        dt,
        filters,
        sessions,
        userExists: Boolean(resp?.data?.user),
        eventLog,
        exportCSV() {
          const $dt = unref(dt);

          if (!$dt) {
            return;
          }

          $dt.exportCSV();
        },
        info,
        errors,
        isLoading,
        isResetPasswordLoading,
        async handleSubmit() {
          resetErrors();
          isLoading.value = true;
          const data: IUpdateUserMutationVariables["info"] = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          const resp = await useMutation<IUpdateUserMutation, IUpdateUserMutationVariables>(UpdateUser)({
            uid,
            info: {
              ...data,
            },
          }).then((resp) => resp?.data?.updateUser);
          isLoading.value = false;

          if (!resp) {
            errors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (!errorList) {
            await $router.push({
              name: "admin",
            });
            return;
          }

          for (const error of errorList) {
            errors[error.field as keyof typeof errors].push({
              message: error.message,
            });
          }
        },
        async handleSendPasswordReset() {
          isResetPasswordLoading.value = true;
          const resp = await useMutation<IRequestPasswordResetForMutation, IRequestPasswordResetForMutationVariables>(RequestPasswordResetFor)({
            uid,
          }).then((resp) => resp?.data?.requestPasswordResetFor);
          isResetPasswordLoading.value = false;

          if ("ok" === resp) {
            return toast.add({
              severity: "success",
              summary: "Sent reset link",
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

          return toast.add({
            severity: "error",
            summary: resp,
            closable: true,
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @import "assets/styles/include";

  .container {

    h2 {
      font-size: 2rem;
      margin-top: 4rem;
      text-align: center;
      color: $fer-dark-blue;
    }

    .form {
      display: flex;
      flex-direction: column;
    }

    .errorContainer {
      font-weight: bold;
      display: flex;
      flex-direction: column;
      margin-top: -.75rem;
      margin-bottom: -1.5rem;
      text-align: center;
      color: $fer-error;
      grid-column: span 2;
      gap: .5rem;

      @include media(lg) {
        grid-column: initial;
      }
    }

    .table table {
      width: 100%;
      table-layout: fixed;

      tr {

        > td {
          vertical-align: middle;

          > pre {
            margin: 0;
            white-space: pre-line;
          }
        }
      }
    }
  }

  .dataContainer {
    line-height: 0;
  }

  .tableHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
