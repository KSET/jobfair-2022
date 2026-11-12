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
          :loading="isMembersLoading"
          @filter="handleFilter"
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
                :loading="isMembersLoading"
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
  import {
    useDebounceFn,
  } from "#imports";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import type {
    FilterEvent,
  } from "~/components/util/form/app-dropdown.vue";
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
  import type {
    UserWhereInput,
  } from "~/graphql/client/graphql";

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
      const isMembersLoading = ref(false);

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
        // users: QUser[],
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
        }
        `,
        variables: {
          vat: route.params.vat as string,
        },
      })();

      type UserQueryData = {
        users: QUser[],
      };
      type UsesrQueryArgs = {
        where: UserWhereInput,
      };

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

      const initialMembers = res?.data?.company?.members ?? [];
      const knownUsers = new Map<string, QUser>(initialMembers.map((user) => [ user.uid, user ]));
      const rememberUsers = (users: QUser[]) => users.forEach((user) => knownUsers.set(user.uid, user));

      const memberInfo = reactive(companyMembersEdit(initialMembers)(initialMembers));
      const selectedMemberUids = () => memberInfo.members.value as string[];

      const setMemberOptions = (searchResults: QUser[]) => {
        const optionUsers = new Map<string, QUser>();
        for (const uid of selectedMemberUids()) {
          const user = knownUsers.get(uid);
          if (user) {
            optionUsers.set(uid, user);
          }
        }
        for (const user of searchResults) {
          optionUsers.set(user.uid, user);
        }
        memberInfo.members.options = companyMembersEdit()([ ...optionUsers.values() ]).members.options;
      };

      let lastFetchedTerm = "";
      const reloadUsers = async (userSearchHead: string) => {
        const usersQuery = useQuery<UserQueryData, UsesrQueryArgs>({
          query: gql`
            query UserInfo($where: UserWhereInput!) {
              users (where: $where) {
                  uid
                  name
                  email
              }
            }
          `,
          variables: {
            where: {
              OR: [ {
                firstName: {
                  contains: userSearchHead,
                  mode: "insensitive",
                },
              }, {
                lastName: {
                  contains: userSearchHead,
                  mode: "insensitive",
                },
              }, {
                email: {
                  contains: userSearchHead,
                  mode: "insensitive",
                },
              } ],
            } as UserWhereInput,
          },
        });

        const resUsers = await usersQuery();
        const users = resUsers?.data?.users;
        if (!users) {
          return;
        }

        lastFetchedTerm = userSearchHead;
        rememberUsers(users);
        setMemberOptions(users);
      };

      const debouncedReloadUsers = useDebounceFn((term: string) => {
        void reloadUsers(term);
      }, 300);

      const handleFilter = (ev: Pick<FilterEvent, "value">) => {
        const term = String((ev as { value?: unknown, }).value ?? "").trim();
        if (3 > term.length) {
          return;
        }

        if (lastFetchedTerm && term.toLowerCase().startsWith(lastFetchedTerm.toLowerCase())) {
          return;
        }

        void debouncedReloadUsers(term);
      };

      const memberInfoErrors = reactive(mapObject(() => [] as AuthError[], {
        ...memberInfo,
        entity: "",
      }) as Record<keyof typeof memberInfo | "entity", AuthError[]>);
      const resetMemberInfoErrors = () => keys(memberInfoErrors).forEach((key) => memberInfoErrors[key] = []);

      return {
        company,
        info,
        errors,
        isLoading,
        isMembersLoading,
        handleFilter,
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

          isMembersLoading.value = true;
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
          isMembersLoading.value = false;

          if (!resp) {
            memberInfoErrors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const errorList = resp.errors;

          if (errorList) {
            for (const error of errorList) {
              (memberInfoErrors[error.field as keyof typeof memberInfoErrors] ?? memberInfoErrors.entity).push({
                message: error.message,
              });
            }
            return;
          }

          if (!resp.entity) {
            memberInfoErrors.entity.push({
              message: "errors.somethingWentWrong",
            });
            return;
          }

          const newMembers = resp.entity.members as QUser[];
          company.members = newMembers;
          rememberUsers(newMembers);
          memberInfo.members.value = newMembers.map((member) => member.uid);
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
