<template>
  <app-max-width-container
    :class="$style.container"
    :not-found="!season"
  >
    <h1 class="mb-3">
      Prijave na {{ season.name }}
    </h1>
    <h3 class="text-center mt-0">
      <time :datetime="season.startsAt" v-text="new Date(season.startsAt).toLocaleString()" />
      -
      <time :datetime="season.endsAt" v-text="new Date(season.endsAt).toLocaleString()" />
    </h3>

    <form @submit.prevent="handleSubmit">
      <table :class="$style.table">
        <thead>
          <tr>
            <th>
              Firma
            </th>
            <th>
              Booth
            </th>
            <th>
              Talk
            </th>
            <th>
              Workshop
            </th>
            <th>
              Panel
            </th>
            <th>
              Cocktail
            </th>
            <th>
              Hide logo
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="application in applicationInputs"
            :key="application.uid"
          >
            <td
              :title="application.legalName"
              v-text="application.brandName"
            />
            <td
              v-for="input in application.inputs"
              :key="`${application.uid}-${input.name}`"
            >
              <input
                v-if="input.type === Inputs.Checkbox"
                v-model="input.value"
                :disabled="!input.enabled || isLoading"
                type="checkbox"
              >
              <input
                v-else-if="input.type === Inputs.Number"
                v-model="input.value"
                :disabled="!input.enabled || isLoading"
                min="0"
                pattern="\d+"
                required
                step="1"
                type="number"
              >
            </td>
          </tr>
          <tr>
            <td colspan="999">
              <div class="flex mt-2">
                <p-button
                  :loading="isLoading"
                  class="p-button-sm"
                  type="button"
                  @click.prevent="selectAll"
                >
                  Select all
                </p-button>
                <p-button
                  :loading="isLoading"
                  class="ml-auto p-button-sm"
                  type="submit"
                >
                  Save
                </p-button>
              </div>

              <div class="mt-5 text-left">
                <nuxt-link :to="{ name: 'admin' }">
                  <p-button class="p-button-sm" type="button">
                    Cancel
                  </p-button>
                </nuxt-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    defineComponent,
    reactive,
    ref,
    createError,
    useRoute,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    nameAliases,
  } from "~/helpers/company/application";
  import useTitle from "~/composables/useTitle";
  import {
    graphql,
  } from "~/graphql/client";

  export default defineComponent({
    name: "PageCompanyApplicationSeasonApprovals",

    components: {
      AppMaxWidthContainer,
    },

    async setup() {
      const title = ref("Prijave na sezonu");
      useTitle(title, false);

      const route = useRoute();
      const toast = useToast();
      const seasonUid = route.params.season as string;

      const isLoading = ref(false);
      const res = await useQuery({
        query: graphql(/* GraphQL */`
          query PageAdminSeasonApplicationsApproval_Base($season: String!) {
            season(uid: $season) {
                name
                startsAt
                endsAt
                applications {
                    wantsPanel
                    wantsCocktail
                    booth
                    talk {
                        titleEn
                        titleHr
                    }
                    workshop {
                        titleEn
                        titleHr
                    }
                    forCompany {
                        uid
                        legalName
                        brandName
                    }
                    approval {
                        booth
                        talkParticipants
                        workshopParticipants
                        panel
                        cocktail
                        logoHidden
                    }
                }
            }
          }
        `),
        variables: {
          season: seasonUid,
        },
      })().then((res) => res?.data);

      if (!res?.season) {
        throw createError({
          statusCode: 500,
        });
      }

      type QSeason = NonNullable<(typeof res)["season"]>;
      type QApplication = QSeason["applications"][number];
      type QApproval = NonNullable<QApplication["approval"]>;

      const { season } = res;

      if (season) {
        title.value = `Prijave na ${ season.name }`;
      }

      enum Inputs {
        Checkbox,
        Number,
      }

      type ForInputVals = {
        [Inputs.Checkbox]: boolean,
        [Inputs.Number]: number,
      };

      type ForInput<Type extends Inputs> = {
        name: string,
        type: Type,
        enabled: boolean,
        value: ForInputVals[Type],
      };

      function forInput<T extends Inputs>(
        name: string,
        type: T,
        enabled: unknown,
        value?: ForInputVals[T],
      ): ForInput<T> {
        const base = {
          name,
          type,
          enabled: Boolean(enabled),
        };

        const input =
          (): ForInput<T> => {
            switch (type) {
              case Inputs.Checkbox: {
                return {
                  ...base,
                  value: value ?? false,
                } as unknown as ForInput<T>;
              }

              case Inputs.Number: {
                return {
                  ...base,
                  value: value ?? 0,
                } as unknown as ForInput<T>;
              }

              default: {
                return {
                  ...base,
                  value: value ?? null,
                } as unknown as ForInput<T>;
              }
            }
          }
        ;

        return reactive(input()) as unknown as ForInput<T>;
      }

      const applicationInputs = season.applications.map((application) => ({
        ...application.forCompany,
        inputs:
          application.approval
            ? (
              Object
                .entries(application.approval)
                .map(
                  ([ name, value ]) => {
                    const fieldName = (nameAliases[name as keyof QApproval] || name) as keyof QApplication;
                    const enabled =
                      fieldName in application
                        ? Boolean(application[fieldName])
                        : true
                    ;

                    return forInput(
                      name,
                      "number" === typeof value ? Inputs.Number : Inputs.Checkbox,
                      enabled,
                      value,
                    );
                  },
                )
            )
            : [
              forInput("booth", Inputs.Checkbox, application.booth),
              forInput("talkParticipants", Inputs.Number, application.talk),
              forInput("workshopParticipants", Inputs.Number, application.workshop),
              forInput("panel", Inputs.Checkbox, application.wantsPanel),
              forInput("cocktail", Inputs.Checkbox, application.wantsCocktail),
              forInput("logoHidden", Inputs.Checkbox, true, false),
            ]
        ,
      }));

      const approveCompanyApplicationsMutation = useMutation(graphql(/* GraphQL */ `
        mutation PageAdminSeasonApplicationsApproval_ApproveCompanyApplications($companies: [ApproveCompanyApplicationsInput!]!, $season: String!) {
          approveCompanyApplications(companies: $companies, season: $season) {
            booth
            talkParticipants
            workshopParticipants
            panel
            cocktail
            forApplication {
              forCompany {
                uid
              }
            }
          }
        }
      `));

      return {
        season,
        applicationInputs,
        Inputs,
        isLoading,
        async handleSubmit() {
          if (!applicationInputs) {
            return;
          }

          const data = applicationInputs.map((application) => ({
            uid: application.uid,
            parts: Object.fromEntries(application.inputs.map((input) => [
              input.name,
              input.value,
            ])),
          }));

          isLoading.value = true;
          const resp = await approveCompanyApplicationsMutation({
            season: seasonUid,
            companies: data,
          });
          isLoading.value = false;

          if (resp?.data && !resp?.error) {
            toast.add({
              severity: "success",
              summary: "Saved",
              closable: true,
              life: 3000,
            });
            return;
          }

          alert("Something went wrong. Please try again.");
        },
        selectAll() {
          for (const app of (applicationInputs || [])) {
            for (const input of app.inputs) {
              if (!input.enabled) {
                continue;
              }

              if (input.value) {
                continue;
              }

              switch (input.type) {
                case Inputs.Number: {
                  input.value = 1;
                  break;
                }

                case Inputs.Checkbox: {
                  input.value = true;
                  break;
                }
              }
            }
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    .table {
      margin: 0 auto;

      th {
        padding: 0 1em;
      }

      td {
        text-align: center;

        input {
          display: inline-block;
          max-width: 60px;
          text-align: center;
        }
      }
    }
  }
</style>
