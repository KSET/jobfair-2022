<template>
  <app-max-width-container
    :class="$style.container"
    :not-found="!hasData"
  >
    <div>
      <nuxt-link :to="{ name: 'account-manager' }">
        &larr;
        <translated-text trans-key="account-manager.back" />
      </nuxt-link>
    </div>

    <h1>
      <translated-text trans-key="account-manager.company.edit.title" />
      <template v-if="companyName">
        &mdash; {{ companyName }}
      </template>
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
          |
          <p-button
            class="p-button-text p-button-danger"
            :loading="removingUid === member.uid"
            :disabled="null !== removingUid"
            icon="pi pi-trash"
            @click="handleRemoveMember(member)"
          />
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
        placeholder="eg. matija.horvat@kset.org"
      />
      <p-button
        :loading="newMember.loading"
        class="p-button-secondary mt-2"
        type="submit"
      >
        <translated-text trans-key="form.save" />
      </p-button>
    </form>
  </app-max-width-container>
</template>

<script lang="ts">
  import {
    defineComponent,
    reactive,
    ref,
    useCssModule,
  } from "vue";
  import {
    useRoute,
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
  import {
    gql,
  } from "@urql/core";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import AppFormgroup from "~/components/util/form/app-formgroup.vue";
  import AppInput from "~/components/util/form/app-input.vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    useIndustriesStore,
  } from "~/store/industries";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    companyCreate,
  } from "~/helpers/forms/company";
  import useTitle from "~/composables/useTitle";
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
  } from "~/graphql/schema";
  import {
    computed,
  } from "#imports";

  export default defineComponent({
    name: "PageAccountManagerCompanyEdit",

    components: {
      AppInput,
      AppFormgroup,
      AppMaxWidthContainer,
      TranslatedText,
    },

    async setup() {
      useTitle("account-manager.company.edit.title");

      const $style = useCssModule();
      const route = useRoute();
      const toast = useToast();
      const companyStore = useCompanyStore();
      const industriesStore = useIndustriesStore();
      const translationsStore = useTranslationsStore();

      const vat = route.params.vat as string;

      const isLoading = ref(false);

      type QMember = Pick<IUser, "uid" | "name" | "email">;
      type QData = {
        industries: Pick<IIndustry, "name" | "nameEn">[],
        company: (ICompany & {
          rasterLogo: Pick<IImage, "name" | "uid"> & {
            full: Pick<IImageVariation, "mimeType">,
          },
          vectorLogo: Pick<IFile, "uid" | "name" | "mimeType">,
        }) | null,
      };
      type QArgs = {
        vat: string,
      };
      const resp = await useQuery<QData, QArgs>({
        query: gql`
          query AccountManagerCompany($vat: String!) {
            industries {
              name
              nameEn
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
          }
        `,
        variables: {
          vat,
        },
      })();

      const company = resp?.data?.company ?? null;

      const members = ref<QMember[]>((company?.members ?? []) as QMember[]);
      const removingUid = ref<string | null>(null);

      const membersQuery = useQuery<{ company: { members: QMember[] | null, } | null, }, QArgs>({
        query: gql`
          query AccountManagerCompanyMembers($vat: String!) {
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
      const refreshMembers = async () => {
        const resp = await membersQuery();
        members.value = resp?.data?.company?.members ?? [];
      };

      const memberAddMutation = useMutation<{ addCompanyMember: string | null, }, { email: string, vat: string, }>(gql`
        mutation AccountManagerAddCompanyMember($email: String!, $vat: String) {
          addCompanyMember(email: $email, vat: $vat)
        }
      `);

      const memberRemoveMutation = useMutation<{ removeCompanyMember: string | null, }, { email: string, vat: string, }>(gql`
        mutation AccountManagerRemoveCompanyMember($email: String!, $vat: String) {
          removeCompanyMember(email: $email, vat: $vat)
        }
      `);

      industriesStore.setIndustries(resp?.data?.industries);
      const industries = computed(() => industriesStore.industryOptions);
      const newMember = reactive({
        email: "",
        loading: false,
      });

      const info_ = companyCreate(company ?? undefined)(industries);
      const info = reactive({
        ...info_,
        industry: {
          ...info_.industry,
        },
        descriptionEn: {
          ...info_.descriptionEn,
          classes: [
            $style.column1,
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
        hasData: null !== company,
        companyName: company?.brandName ?? "",
        isLoading,
        info,
        errors,
        newMember,
        members,
        removingUid,
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
              summary: translationsStore.translation("account-manager.company.edit.saved"),
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
            vat,
          }).then((x) => x?.data?.addCompanyMember);
          newMember.loading = false;

          if ("" === resp) {
            toast.add({
              severity: "success",
              summary: translationsStore.translation("account-manager.company.add-member.success"),
              closable: true,
              life: 3000,
            });
            newMember.email = "";
            await refreshMembers();
          } else {
            toast.add({
              severity: "error",
              summary: resp ?? translationsStore.translation("errors.somethingWentWrong"),
              closable: true,
              life: 5000,
            });
          }
        },
        async handleRemoveMember(member: QMember) {
          if (!window.confirm(`${ translationsStore.translation("account-manager.company.members.remove-confirm") } ${ member.email }`)) {
            return;
          }

          removingUid.value = member.uid;
          const resp = await memberRemoveMutation({
            email: member.email,
            vat,
          }).then((x) => x?.data?.removeCompanyMember);
          removingUid.value = null;

          if ("" === resp) {
            toast.add({
              severity: "success",
              summary: translationsStore.translation("account-manager.company.members.removed"),
              closable: true,
              life: 3000,
            });
            await refreshMembers();
          } else {
            toast.add({
              severity: "error",
              summary: resp ?? translationsStore.translation("errors.somethingWentWrong"),
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

      .column1 {
        grid-column: 1;

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
