<template>
  <app-user-profile-container>
    <h1>
      <translated-text trans-key="profile.header" />
    </h1>

    <div
      :class="$style.items"
      class="grid"
    >
      <div
        v-if="currentSeason && !hasCompany && false"
        :class="$style.item"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.applicationsOpen.registerCompany.header" />
          </h2>
          <p :class="$style.applicationsText">
            <translated-text trans-key="profile.company.applicationsOpen.registerCompany.text" />
          </p>
        </div>

        <div :class="$style.itemActions">
          <a
            :href="$router.resolve({ name: 'profile-register-company' }).href"
            class="ml-auto"
          >
            <p-button
              class="p-button-secondary"
              tabindex="-1"
            >
              <translated-text
                trans-key="profile.company.register"
              />
            </p-button>
          </a>
        </div>
      </div>

      <div
        v-if="currentSeason && hasCompany"
        :class="$style.item"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.applicationsOpen.header" />
          </h2>
          <h3>
            <translated-text trans-key="profile.season" />
            : <em v-text="currentSeason.name" />
          </h3>
          <template v-if="companyApplication">
            <h4>
              <translated-text trans-key="profile.company.applicationsOpen.subHeader" />
            </h4>
            <ul>
              <li v-if="companyApplication.booth">
                <strong>
                  <translated-text trans-key="profile.company.booth" />
                  :
                </strong>&nbsp;<em v-text="booths[companyApplication.booth]" />
              </li>
              <li v-if="companyApplication.talk">
                <strong>
                  <translated-text trans-key="profile.company.talk" />
                  :
                </strong>&nbsp;<em v-text="companyApplication.talk.titleEn" />
              </li>
              <li v-if="companyApplication.workshop">
                <strong>
                  <translated-text trans-key="profile.company.workshop" />
                  :
                </strong>&nbsp;<em v-text="companyApplication.workshop.titleEn" />
              </li>
              <li v-if="companyApplication.wantsPanel">
                <strong>
                  <translated-text trans-key="profile.company.panel" />
                  :
                </strong>&nbsp;<em>
                  <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" /></em>
              </li>
              <li v-if="companyApplication.wantsCocktail">
                <strong>
                  <translated-text trans-key="profile.company.cocktail" />
                  :
                </strong>&nbsp;<em>
                  <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" /></em>
              </li>
            </ul>
          </template>
          <template v-else>
            <p :class="$style.applicationsText">
              <translated-text trans-key="profile.company.applicationsOpen.text" />
              <translated-text trans-key="profile.company.applicationsOpen.text.from" />
              <time
                :datetime="new Date(currentSeason.startsAt).toISOString()"
                :title="new Date(currentSeason.startsAt).toLocaleDateString()"
                v-text="formatDate(currentSeason.startsAt)"
              />
              <translated-text trans-key="profile.company.applicationsOpen.text.until" />
              <time
                :datetime="new Date(currentSeason.endsAt).toISOString()"
                :title="new Date(currentSeason.endsAt).toLocaleDateString()"
                v-text="formatDate(currentSeason.endsAt)"
              />
            </p>
          </template>
        </div>
        <div :class="$style.itemActions">
          <a
            :href="$router.resolve({ name: 'profile-me-company-signup' }).href"
            class="ml-auto"
          >
            <p-button
              class="p-button-secondary"
              tabindex="-1"
            >
              <translated-text
                v-if="companyApplication"
                trans-key="profile.company.application.update"
              />
              <translated-text
                v-else
                trans-key="profile.company.application.apply"
              />
            </p-button>
          </a>
        </div>
      </div>
    </div>
  </app-user-profile-container>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import {
    gql,
  } from "@urql/core";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    IBooth,
    ICompanyApplication,
  } from "~/graphql/schema";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import TranslatedText from "~/components/TranslatedText.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import {
    formatDate,
  } from "~/helpers/date";
  import useTitle from "~/composables/useTitle";

  export default defineComponent({
    name: "PageProfileHome",

    components: {
      TranslatedText,
      AppUserProfileContainer,
    },

    async setup() {
      useTitle("profile.header");

      const seasonsStore = useSeasonsStore();
      const userStore = useUserStore();

      type QData = {
        companyApplication: {
          workshop: Pick<NonNullable<ICompanyApplication["workshop"]>, "titleEn">,
          talk: Pick<NonNullable<ICompanyApplication["talk"]>, "titleEn">,
          booth: ICompanyApplication["booth"],
          wantsPanel: ICompanyApplication["wantsPanel"],
          wantsCocktail: ICompanyApplication["wantsCocktail"],
        },
        booths: Pick<IBooth, "key" | "name">[],
      };
      type QArgs = never;
      const resp = await useQuery<QData, QArgs>({
        query: gql`
        query {
            booths {
                key
                name
            }
            companyApplication {
                workshop {
                    titleEn
                }
                talk {
                    titleEn
                }
                booth
                wantsPanel
                wantsCocktail
            }
        }
        `,
      })();

      const booths = computed(() => Object.fromEntries((resp?.data?.booths || [] as QData["booths"]).map((b) => [ b.key || "", b.name ])));
      return {
        formatDate,
        booths,
        currentSeason: computed(() => seasonsStore.currentSeason),
        hasCompany: computed(() => userStore.hasCompany),
        companyApplication: computed(() => resp?.data?.companyApplication),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include";

  .items {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr 1fr;

    @include media(lg) {
      grid-template-columns: 1fr;
    }

    .item {
      display: flex;
      flex-direction: column;
      padding: var(--item-padding);
      transition-property: padding;
      background-color: $fer-gray;
      box-shadow: #{map.get($shadows, "shadow-3")};

      --item-padding: .875rem;

      @include media(lg) {
        --item-padding: .5rem;
      }

      .itemContent {
        height: 100%;
        padding: 1rem;
        border-radius: 4px;
        background-color: $fer-white;
        box-shadow: #{map.get($shadows, "shadow-3")};

        > * {
          opacity: .7;
        }
      }

      .itemHeader {
        margin: 0 0 2.5rem;
        opacity: 1;
        color: $fer-dark-blue;
      }

      .itemActions {
        display: flex;
        margin-top: var(--item-padding);

        :global(.p-button) {
          padding: .625rem 1.125rem;
          transition-property: padding;

          @include media(lg) {
            padding: .875rem 1.25rem;
          }
        }
      }
    }
  }

  .applicationsText {

    & > * + * {

      &::before {
        content: " ";
      }
    }
  }
</style>
