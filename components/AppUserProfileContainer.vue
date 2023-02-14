<template>
  <div style="display: contents;">
    <div v-if="!notFound" :class="$style.container">
      <aside :class="$style.aside">
        <div :class="$style.avatarContainer">
          <profile-picture />
        </div>
        <p
          class="text-center"
          v-text="user.email"
        />
        <div :class="$style.linksContainer">
          <ul>
            <li>
              <nuxt-link
                :to="{ name: 'profile-me' }"
              >
                <translated-text
                  trans-key="profile.my-profile"
                />
              </nuxt-link>
            </li>
            <li>
              <nuxt-link
                :to="{ name: 'profile-me-settings' }"
              >
                <translated-text
                  trans-key="profile.settings"
                />
              </nuxt-link>
            </li>
            <template v-if="hasCompany">
              <li>
                <nuxt-link
                  :to="{ name: 'profile-me-company' }"
                >
                  <translated-text
                    trans-key="profile.company"
                  />
                </nuxt-link>
              </li>
              <li v-if="applicationsOpen">
                <nuxt-link
                  :to="{ name: 'profile-me-company-signup' }"
                >
                  <translated-text
                    trans-key="profile.company.signup"
                  />
                </nuxt-link>
              </li>
              <li v-else-if="applicationApproved && applicationsEditable">
                <nuxt-link
                  :to="{ name: 'profile-me-company-application-edit' }"
                >
                  <translated-text
                    trans-key="profile.company.application.edit"
                  />
                </nuxt-link>
              </li>
              <li v-if="canViewResumes">
                <nuxt-link
                  :to="{ name: 'profile-me-company-resumes' }"
                >
                  <translated-text
                    trans-key="profile.company.resumes"
                  />
                </nuxt-link>
              </li>
              <li v-if="canScanUsers">
                <nuxt-link
                  :to="{ name: 'profile-me-company-scan-qr' }"
                >
                  <translated-text
                    trans-key="profile.company.scan-qr"
                  />
                </nuxt-link>
              </li>
            </template>
            <template v-else>
              <li>
                <nuxt-link
                  :to="{ name: 'profile-register-company' }"
                >
                  <translated-text
                    trans-key="profile.company-register"
                  />
                </nuxt-link>
              </li>
            </template>
            <li>
              <nuxt-link
                :to="{ name: 'profile-me-cv' }"
              >
                <translated-text
                  trans-key="profile.cv"
                />
              </nuxt-link>
            </li>
          </ul>
        </div>
      </aside>

      <div :class="$style.content">
        <slot />
      </div>
    </div>
    <app-max-width-container v-else>
      <page-not-found />
    </app-max-width-container>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
  } from "vue";
  import TranslatedText from "~/components/TranslatedText.vue";
  import ProfilePicture from "~/components/user/profile/profile-picture.vue";
  import {
    useUserStore,
  } from "~/store/user";
  import PageNotFound from "~/components/page-not-found.vue";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer.vue";
  import {
    useSeasonsStore,
  } from "~/store/seasons";
  import {
    useCompanyStore,
  } from "~/store/company";

  export default defineComponent({
    components: {
      AppMaxWidthContainer,
      TranslatedText,
      ProfilePicture,
      PageNotFound,
    },

    props: {
      notFound: {
        required: false,
        type: Boolean,
        default: () => false,
      },
    },

    setup() {
      const userStore = useUserStore();
      const seasonsStore = useSeasonsStore();
      const companyStore = useCompanyStore();

      return {
        isSeasonInProgress: computed(() => Boolean(seasonsStore.currentSeason)),
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        applicationsEditable: computed(() => seasonsStore.areApplicationsEditable),
        applicationApproved: computed(() => companyStore.hasApplicationApproved),
        canScanUsers: computed(() => companyStore.canScanUsers),
        canViewResumes: computed(() => companyStore.canViewResumes),
        user: computed(() => userStore.user),
        hasCompany: computed(() => userStore.hasCompany),
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:color";
  @import "assets/styles/include";

  .container {
    display: flex;
    flex: 1;

    .aside {
      display: flex;
      flex-direction: column;
      width: 300px;
      padding: 3.75rem 1rem 2rem;
      color: $fer-white;
      background-color: $fer-dark-blue;

      @include media(md) {
        display: none;
      }

      .avatarContainer {
        overflow: hidden;
        width: 60%;
        margin: 0 auto;
        border: 2px solid $fer-off-gray;
        border-radius: 100%;
        background-color: $fer-gray;
      }

      .linksContainer {
        display: flex;
        flex-direction: column;
        margin-top: 5rem;

        > ul {
          margin: 0;
          padding: 0;
          list-style: none;
          text-align: center;

          > li + li {
            margin-top: 1rem;
          }

          > li {

            > a {
              font-size: 1.125rem;
              font-weight: 600;
              line-height: 1.3125rem;
              padding-inline: .625rem;
              padding-bottom: .25rem;
              transition-property: border-color, padding;
              text-transform: capitalize;
              color: $fer-white;
              border-bottom: 1px solid;

              &:global(.router-link-exact-active) {
                padding-inline: 1.25rem;
                color: $fer-yellow;

                &:hover {
                  padding-inline: 1.25rem;
                }
              }

              &:hover {
                padding-inline: .75rem;
                transition-duration: 0s;
                border-color: #{color.mix($fer-white, $fer-yellow, 50%)} !important;
              }
            }
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 2.5rem;

      > h1 {
        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1.875rem;
        margin-top: 0;
        margin-bottom: 4rem;
        text-align: center;
        color: $fer-dark-blue;

        @include media(md) {
          font-size: 1.625rem;
          margin: 2.25rem 0;
        }
      }
    }
  }
</style>
