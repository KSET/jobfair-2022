<template>
  <app-max-width-container :not-found="!company.uid" :class="$style.container">
    <h1>
      Uredi firmu
    </h1>

    <LazyClientOnly>
      <app-formgroup
        :class="$style.form"
        :errors="errors"
        :inputs="info"
        :loading="isLoading"
        @submit="handleUpdate"
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

          <div :class="$style.column2" class="flex -mt-3">
            <a :href="$router.resolve({ name: 'admin-companies' }).href">
              <p-button>Cancel</p-button>
            </a>

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

      <div class="mt-8">
        <h1>Members</h1>
        <ul>
          <li
            v-for="member of company.members"
            :key="member.uid"
          >
            <span v-text="member.name" />
            -
            <span v-text="member.email" />
          </li>
        </ul>

        <app-formgroup
          :errors="memberInfoErrors"
          :inputs="memberInfo"
          :loading="isLoading"
          @submit="handleMembersUpdate"
        >
          <template #after>
            <div
              v-if="memberInfoErrors.entity.length > 0"
              :class="$style.errorContainer"
            >
              <translated-text
                v-for="err in memberInfoErrors.entity"
                :key="err.message"
                :trans-key="err.message"
              />
            </div>

            <div :class="$style.column2" class="flex -mt-3">
              <a :href="$router.resolve({ name: 'admin-companies' }).href">
                <p-button>Cancel</p-button>
              </a>

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
      </div>
    </LazyClientOnly>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    reactive,
    ref,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    useRoute,
    useRouter,
  } from "vue-router";
  import {
    gql,
  } from "@urql/core";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    companyCreate,
    companyMembersEdit,
  } from "~/helpers/forms/company";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    type ICompany,
    type IFile,
    type IImage,
    type IImageVariation,
    type IIndustry,
    type IUpdateCompanyInfoMutationVariables,
    type IUser,
    type ICreateCompanyResponse,
    type IMutationUpdateCompanyMembersForArgs,
  } from "~/graphql/schema";

  export default defineComponent({
    name: "PageAdminCompanyEdit",

    components: {
      TranslatedText,
      AppFormgroup,
      AppMaxWidthContainer,
    },

    async setup() {
      const $router = useRouter();
      const route = useRoute();
      const companyStore = useCompanyStore();
      const industriesStore = useIndustriesStore();
      const toast = useToast();

      const industriesOptions = computed(() => industriesStore.industries.map((x) => ({ label: x, value: x })));

      const isLoading = ref(false);

      type QCompany = ICompany;
      type QIndustry = Pick<IIndustry, "name">;
      type QUser = Pick<IUser, "uid" | "name" | "email">;
      type QueryData = {
        industries: Pick<IIndustry, "name">[],
        company: QCompany & {
          industry: QIndustry,
          rasterLogo: Pick<IImage, "name" | "uid"> & {
            full: Pick<IImageVariation, "mimeType">,
          },
          vectorLogo: Pick<IFile, "uid" | "name" | "mimeType">,
          members: QUser[],
        },
        users: QUser[],
      };
      type QueryArgs = {
        vat: string,
      };
      const res = await useQuery<QueryData, QueryArgs>({
        query: gql`
        query EditInfo($vat: String!) {
            company(vat: $vat) {
              uid
              legalName
              brandName
              descriptionEn
              descriptionHr
              address
              vat
              website
              facebook
              instagram
              linkedIn
              industry {
                  name
              }
              rasterLogo {
                  uid
                  name
                  full {
                      mimeType
                  }
              }
              vectorLogo {
                  uid
                  name
                  mimeType
              }
              members {
                uid
                name
                email
              }
            }

            industries {
                name
            }

            users {
                uid
                name
                email
            }
        }
        `,
        variables: {
          vat: route.params.vat as string,
        },
      })();

      const company = reactive(res?.data?.company ?? {} as QCompany);

      industriesStore.setIndustries(res?.data?.industries);

      const info_ = companyCreate(res?.data?.company)(industriesOptions);
      const info = reactive(info_);

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      const memberInfo = reactive(companyMembersEdit(res?.data?.company?.members)(res?.data?.users));

      const memberInfoErrors = reactive(mapObject(() => [] as AuthError[], {
        ...memberInfo,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetMemberInfoErrors = () => keys(memberInfoErrors).forEach((key) => memberInfoErrors[key] = []);

      return {
        company,
        info,
        errors,
        isLoading,
        memberInfo,
        memberInfoErrors,
        async handleUpdate() {
          resetErrors();
          const data: IUpdateCompanyInfoMutationVariables["info"] = pipe(
            (x: typeof info) => keys(x),
            map((key) => [ key, (info[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(info);

          if ("string" === typeof data.vectorLogo) {
            delete data.vectorLogo;
          }

          if ("string" === typeof data.rasterLogo) {
            delete data.rasterLogo;
          }

          isLoading.value = true;
          const resp = await companyStore.updateCompanyInfo({
            info: data,
          });
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

        async handleMembersUpdate() {
          resetMemberInfoErrors();

          const data: { members: IMutationUpdateCompanyMembersForArgs["members"], } = pipe(
            (x: typeof memberInfo) => keys(x),
            map((key) => [ key, (memberInfo[key] as { value: unknown, }).value ]),
            Object.fromEntries,
          )(memberInfo);

          isLoading.value = true;
          const resp = await useMutation<{ updateCompanyMembersFor: ICreateCompanyResponse, }, IMutationUpdateCompanyMembersForArgs>(
            gql`
            mutation UpdateMembers($company: String!, $members: [String!]!) {
                updateCompanyMembersFor(company: $company, members: $members) {
                    errors {
                        field
                        message
                    }

                    entity {
                        members {
                            uid
                            name
                            email
                        }
                    }
                }
            }
            `,
          )({
            company: res!.data!.company.uid,
            members: data.members,
          }).then((resp) => resp?.data?.updateCompanyMembersFor);
          isLoading.value = false;

          if (!resp) {
            errors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (errorList) {
            for (const error of errorList) {
              errors[error.field as keyof typeof errors].push({
                message: error.message,
              });
            }
            return;
          }

          if (!resp.entity) {
            errors.entity.push({
              message: "Something went wrong",
            });
            return;
          }

          company.members = resp.entity.members;
          return toast.add({
            severity: "success",
            summary: "Saved",
            closable: true,
            life: 3000,
          });
        },
      };
    },
  });
</script>

<style lang="scss" module>
  .container {

    .form {
      display: flex;
      flex-direction: column;
    }
  }
</style>
