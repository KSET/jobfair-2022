<template>
  <app-user-profile-container :class="$style.container">
    <h1>
      <translated-text
        trans-key="profile.about-company"
      />
    </h1>

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

        <div :class="$style.column2" class="text-right -mt-3">
          <p-button
            :loading="isLoading"
            class="p-button-secondary font-bold"
            type="submit"
          >
            <translated-text trans-key="form.save" />
          </p-button>
        </div>
      </template>
    </app-formgroup>

    <h2 class="mt-6">
      <translated-text trans-key="profile.about-company.add-members" />
    </h2>
    <ul class="mb-5">
      <li v-for="member in members" :key="member.uid">
        <div :class="$style.companyMember">
          <strong v-text="member.name" /> - <em v-text="member.email" />
          <template v-if="user.uid !== member.uid">
            |
            <p-button
              class="p-button-text p-button-danger"
              :loading="newMember.loading"
              icon="pi pi-trash"
              @click="handleRemoveMember(member.email)"
            />
          </template>
        </div>
      </li>
    </ul>
    <form class="flex flex-column" style="max-width: 30em;" @submit.prevent="handleAddMember">
      <app-input
        v-model="newMember.email"
        :disabled="newMember.loading"
        type="email"
        name="new-member"
        label-key="profile.about-company.add-member"
        required
      />
      <p-button
        :loading="newMember.loading"
        class="p-button-secondary mt-2"
        type="submit"
      >
        <translated-text trans-key="form.save" />
      </p-button>
    </form>
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
    useCssModule,
  } from "vue";
  import {
    keys,
    map,
    mapObject,
    pipe,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import {
    gql,
  } from "@urql/core";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    companyCreate,
  } from "~/helpers/forms/company";
  import useTitle from "~/composables/useTitle";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    ICompany,
    IFile,
    IImage,
    IImageVariation,
    IIndustry,
    IUpdateCompanyInfoMutationVariables,
    IUser,
  } from "~/graphql/schema";
  import {
    computed,
    unref,
  } from "#imports";
  import AppInput from "~/components/util/form/app-input.vue";

  export default defineComponent({
    name: "PageProfileCompanyHome",

    components: {
      AppInput,
      TranslatedText,
      AppFormgroup,
      AppUserProfileContainer,
    },

    async setup() {
      useTitle("profile.about-company");

      const $style = useCssModule();
      const toast = useToast();
      const userStore = useUserStore();
      const companyStore = useCompanyStore();

      const isLoading = ref(false);

      const user = computed(() => userStore.user!);
      const [ { vat } ] = unref(user).companies;

      type QData = {
        industries: Pick<IIndustry, "name">[],
        company: ICompany & {
          rasterLogo: Pick<IImage, "name" | "uid"> & {
            full: Pick<IImageVariation, "mimeType">,
          },
          vectorLogo: Pick<IFile, "uid" | "name" | "mimeType">,
          members: Pick<IUser, "uid" | "name" | "email">[],
        },
      };
      type QArgs = {
        vat: string,
      };
      const resp = await useQuery<QData, QArgs>({
        query: gql`
            query Company($vat: String!) {
                industries {
                    name
                }
                company(vat: $vat) {
                    uid
                    legalName
                    brandName
                    descriptionEn
                    descriptionHr
                    address
                    vat
                    website
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
            }
        `,
        variables: {
          vat,
        },
      })();

      const membersQuery = useQuery<{ company: Pick<QData["company"], "members">, }, QArgs>({
        query: gql`
            query Company($vat: String!) {
                company(vat: $vat) {
                    members {
                        uid
                        name
                        email
                    }
                }
            }
        `,
        variables: {
          vat,
        },
      });

      const memberAddMutation = useMutation<{ addCompanyMember: string, }, { email: string, }>(gql`
        mutation UpdateMembers($email: String!) {
            addCompanyMember(email: $email)
        }
      `);

      const memberRemoveMutation = useMutation<{ removeCompanyMember: string, }, { email: string, }>(gql`
        mutation UpdateMembers($email: String!) {
            removeCompanyMember(email: $email)
        }
      `);

      const industries = (resp?.data?.industries || []).map((x) => ({ label: x.name, value: x.name }));
      const members = ref(resp?.data?.company?.members || []);
      const newMember = reactive({
        email: "",
        loading: false,
      });

      const info_ = companyCreate(resp?.data?.company)(industries);
      const info = reactive({
        ...info_,
        industry: {
          ...info_.industry,
          classes: [
            $style.column2,
          ],
        },
      });

      type AuthError = {
        message: string,
      };
      const errors = reactive(mapObject(() => [] as AuthError[], {
        ...info,
        entity: "",
      }) as Record<keyof typeof info | "entity", AuthError[]>);
      const resetErrors = () => keys(errors).forEach((key) => errors[key] = []);

      return {
        isLoading,
        info,
        errors,
        user,
        members,
        newMember,
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
            toast.add({
              severity: "success",
              summary: "Success",
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
        },
        async handleAddMember() {
          newMember.loading = true;
          const resp = await memberAddMutation({
            email: newMember.email,
          }).then((x) => x?.data?.addCompanyMember);
          newMember.loading = false;

          if ("" === resp) {
            members.value = await membersQuery().then((resp) => resp?.data?.company?.members || []);
            newMember.email = "";
          } else {
            toast.add({
              severity: "error",
              summary: resp ?? "Something went wrong",
              closable: true,
              life: 5000,
            });
          }
        },
        async handleRemoveMember(email: string) {
          if (!confirm(`Remove ${ email } from company?`)) {
            return;
          }

          newMember.loading = true;
          const resp = await memberRemoveMutation({
            email,
          }).then((x) => x?.data?.removeCompanyMember);
          newMember.loading = false;

          if ("" === resp) {
            members.value = await membersQuery().then((resp) => resp?.data?.company?.members || []);
          } else {
            toast.add({
              severity: "error",
              summary: resp ?? "Something went wrong",
              closable: true,
              life: 5000,
            });
          }
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include/index";

  .container {

    .form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-column-gap: min(6.25rem, 7.5vw);

      @include media(lg) {
        grid-template-columns: minmax(0, 1fr);
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
      }

      .column2 {
        grid-column: 2;

        @include media(lg) {
          grid-column: initial;
        }
      }
    }

    .companyMember {
      display: flex;
      align-items: center;
      gap: .4em;

      button {
        width: 1.5em;
        height: 1.5em;
        padding: 0;
      }
    }
  }
</style>
