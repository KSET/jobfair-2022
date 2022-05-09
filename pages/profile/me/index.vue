<template>
  <app-user-profile-container>
    <h1>
      <translated-text trans-key="profile.header" />
    </h1>

    <div :class="$style.items">
      <div :class="$style.item">
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.user.edit.header" />
          </h2>
          <dl style="line-height: 1.5;">
            <dd v-text="user.name" />
            <dd v-text="user.email" />
            <dd v-if="(user.companies?.length ?? 0) > 0">
              <translated-text trans-key="profile.user.companies" />
              <ul class="m-0" style="list-style: inside;">
                <li v-text="user.companies[0].brandName" />
              </ul>
            </dd>
          </dl>
        </div>

        <div :class="$style.itemActions">
          <nuxt-link
            :to="{ name: 'profile-me-settings' }"
            class="ml-auto"
          >
            <p-button
              class="p-button-secondary"
              tabindex="-1"
            >
              <translated-text
                trans-key="profile.settings"
              />
            </p-button>
          </nuxt-link>
        </div>
      </div>

      <template v-if="resume">
        <div :class="$style.item">
          <div :class="$style.itemContent">
            <h2 :class="$style.itemHeader">
              <translated-text trans-key="profile.resume.qr" />
            </h2>
            <div :class="$style.qrCode">
              <app-img
                :alt="`${user.name} QR`"
                :src="`/api/user/${user.uid}/qr.svg`"
                contain
              />
            </div>
          </div>
          <div :class="$style.itemActions">
            <nuxt-link
              :to="{ name: 'profile-me-cv' }"
              class="ml-auto"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="profile.resume.update"
                />
              </p-button>
            </nuxt-link>
          </div>
        </div>

        <div :class="$style.item">
          <div :class="$style.itemContent">
            <h2 :class="$style.itemHeader">
              <translated-text trans-key="profile.events.sign-up" />
            </h2>
            <dl :class="$style.reservationItems">
              <dt
                v-for="item in calendar"
                :key="item.uid"
              >
                <p-button
                  :loading="item.loading"
                  @click="handleSignupFor(item)"
                >
                  <translated-text v-if="item.forWorkshop.reservation" trans-key="company.event.user.sign-off" />
                  <translated-text v-else trans-key="company.event.user.sign-up" />
                </p-button>
                <strong
                  :title="translateFor(item.forWorkshop, 'description').value"
                >
                  [{{ item.title }}] {{ translateFor(item.forWorkshop, "title").value }}
                </strong>
              </dt>
            </dl>
          </div>
          <div :class="$style.itemActions">
            <nuxt-link
              :to="{ name: 'profile-me-cv' }"
              class="ml-auto"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="page.name.schedule"
                />
              </p-button>
            </nuxt-link>
          </div>
        </div>
      </template>
      <div v-else-if="!hasCompany" :class="$style.item">
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.resume.header" />
          </h2>

          <div>
            <translated-text trans-key="profile.resume.text" />
          </div>
        </div>
        <div :class="$style.itemActions">
          <nuxt-link
            :to="{ name: 'profile-me-cv' }"
            class="ml-auto"
          >
            <p-button
              class="p-button-secondary"
              tabindex="-1"
            >
              <translated-text
                trans-key="profile.resume.create"
              />
            </p-button>
          </nuxt-link>
        </div>
      </div>

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
        v-if="applicationsOpen && hasCompany"
        :class="$style.item"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.applicationsOpen.header" />
          </h2>
          <h3>
            <translated-text
              trans-key="profile.season"
            />
            <span>:&nbsp;</span>
            <em v-text="currentSeason.name" />
          </h3>
          <template v-if="companyApplication">
            <h4>
              <translated-text trans-key="profile.company.applicationsOpen.subHeader" />
            </h4>
            <ul :class="$style.applicationItems">
              <li v-if="companyApplication.booth">
                <strong>
                  <translated-text trans-key="profile.company.booth" />
                </strong>
                <em v-text="booths[companyApplication.booth]" />
              </li>
              <li v-if="companyApplication.talk">
                <strong>
                  <translated-text trans-key="profile.company.talk" />
                </strong>
                <em v-text="companyApplication.talk.titleEn" />
              </li>
              <li v-if="companyApplication.workshop">
                <strong>
                  <translated-text trans-key="profile.company.workshop" />
                </strong>
                <em v-text="companyApplication.workshop.titleEn" />
              </li>
              <li v-if="companyApplication.wantsPanel">
                <strong>
                  <translated-text trans-key="profile.company.panel" />
                </strong>
                <em>
                  <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" />
                </em>
              </li>
              <li v-if="companyApplication.wantsCocktail">
                <strong>
                  <translated-text trans-key="profile.company.cocktail" />
                </strong>
                <em>
                  <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" />
                </em>
              </li>
            </ul>
          </template>
          <template v-else-if="applicationsOpen">
            <p :class="$style.applicationsText">
              <translated-text trans-key="profile.company.applicationsOpen.text" />
              <translated-text trans-key="profile.company.applicationsOpen.text.from" />
              <time
                :datetime="new Date(currentSeason.applicationsFrom).toISOString()"
                :title="new Date(currentSeason.applicationsFrom).toLocaleDateString()"
                v-text="formatDate(currentSeason.applicationsFrom)"
              />
              <translated-text trans-key="profile.company.applicationsOpen.text.until" />
              <time
                :datetime="new Date(currentSeason.applicationsUntil).toISOString()"
                :title="new Date(currentSeason.applicationsUntil).toLocaleDateString()"
                v-text="formatDate(currentSeason.applicationsUntil)"
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
      <div
        v-else-if="!applicationsOpen && companyApplication && companyApplication.approval"
        :class="[$style.item, $style.itemApproval]"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.applicationsApproval.header" />
          </h2>
          <h3>
            <translated-text
              trans-key="profile.season"
            />
            <span>:&nbsp;</span>
            <em v-text="currentSeason.name" />
          </h3>
          <h4>
            <template
              v-if="isApproved"
            >
              <translated-text
                :class="$style.success"
                trans-key="profile.company.applicationsApproval.status.approved"
              />&nbsp;<i
                :class="$style.success"
                class="pi pi-check"
              />
              <div class="mt-1" />
              <translated-text
                class="font-normal"
                trans-key="profile.company.applicationsApproval.status.approved.message"
              />
            </template>
            <template
              v-else
            >
              <translated-text
                :class="$style.error"
                trans-key="profile.company.applicationsApproval.status.denied"
              />&nbsp;<i
                :class="$style.error"
                class="pi pi-times"
              />
            </template>
          </h4>
          <ul
            v-if="isApproved"
            :class="$style.applicationItems"
          >
            <li v-if="companyApplication.approval.booth">
              <strong>
                <translated-text trans-key="profile.company.booth" />
              </strong>
              <em v-text="booths[companyApplication.booth]" />
            </li>
            <li v-if="companyApplication.approval.talkParticipants">
              <strong>
                <translated-text trans-key="profile.company.talk" />
              </strong>
              <em>
                {{ companyApplication.approval.talkParticipants }}
                <translated-text trans-key="profile.company.talk.participants" />
              </em>
            </li>
            <li v-if="companyApplication.approval.workshopParticipants">
              <strong>
                <translated-text trans-key="profile.company.workshop" />
              </strong>
              <em>
                {{ companyApplication.approval.workshopParticipants }}
                <translated-text trans-key="profile.company.talk.participants" />
              </em>
            </li>
            <li v-if="companyApplication.approval.panel">
              <strong>
                <translated-text trans-key="profile.company.panel" />
              </strong>
              <em>
                <i class="pi pi-check" />
              </em>
            </li>
            <li v-if="companyApplication.approval.cocktail">
              <strong>
                <translated-text trans-key="profile.company.cocktail" />
              </strong>
              <em>
                <i class="pi pi-check" />
              </em>
            </li>
          </ul>
        </div>
        <div v-if="isApproved && isApprovedWithoutBooth" :class="$style.itemActions">
          <nuxt-link
            :to="{ name: 'profile-me-company-application-edit' }"
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
          </nuxt-link>
        </div>
      </div>
      <div
        v-else-if="!applicationsOpen && companyApplication && hasCompany"
        :class="$style.item"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.applicationsClosed.header" />
          </h2>
          <h3>
            <translated-text
              trans-key="profile.season"
            />
            <span>:&nbsp;</span>
            <em v-text="currentSeason.name" />
          </h3>
          <h4>
            <translated-text trans-key="profile.company.applicationsOpen.subHeader" />
          </h4>
          <ul :class="$style.applicationItems">
            <li v-if="companyApplication.booth">
              <strong>
                <translated-text trans-key="profile.company.booth" />
              </strong>
              <em v-text="booths[companyApplication.booth]" />
            </li>
            <li v-if="companyApplication.talk">
              <strong>
                <translated-text trans-key="profile.company.talk" />
              </strong>
              <em v-text="companyApplication.talk.titleEn" />
            </li>
            <li v-if="companyApplication.workshop">
              <strong>
                <translated-text trans-key="profile.company.workshop" />
              </strong>
              <em v-text="companyApplication.workshop.titleEn" />
            </li>
            <li v-if="companyApplication.wantsPanel">
              <strong>
                <translated-text trans-key="profile.company.panel" />
              </strong>
              <em>
                <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" />
              </em>
            </li>
            <li v-if="companyApplication.wantsCocktail">
              <strong>
                <translated-text trans-key="profile.company.cocktail" />
              </strong>
              <em>
                <translated-text trans-key="profile.company.interested" />&nbsp;<i class="pi pi-check" />
              </em>
            </li>
          </ul>
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
  import {
    omit,
  } from "rambdax";
  import AppImg from "../../../components/util/app-img.vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    IApplicationWorkshop,
    IBooth,
    ICalendarItem,
    ICompanyApplication,
    IMutationUpdateEventReservationArgs,
    IResume,
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
  import {
    useCompanyStore,
  } from "~/store/company";
  import {
    reactive,
  } from "#imports";
  import {
    EventType,
    statusFromEventList,
  } from "~/helpers/event-status";
  import {
    Language,
    useTranslationsStore,
  } from "~/store/translations";

  export default defineComponent({
    name: "PageProfileHome",

    components: {
      AppImg,
      TranslatedText,
      AppUserProfileContainer,
    },

    async setup() {
      useTitle("profile.header");

      const seasonsStore = useSeasonsStore();
      const userStore = useUserStore();
      const companyStore = useCompanyStore();
      const translationsStore = useTranslationsStore();

      type QData = {
        companyApplication: {
          workshop: Pick<NonNullable<ICompanyApplication["workshop"]>, "titleEn">,
          talk: Pick<NonNullable<ICompanyApplication["talk"]>, "titleEn">,
          booth: ICompanyApplication["booth"],
          wantsPanel: ICompanyApplication["wantsPanel"],
          wantsCocktail: ICompanyApplication["wantsCocktail"],
          approval: ICompanyApplication["approval"],
        },
        booths: Pick<IBooth, "key" | "name">[],
        profile: {
          resume: Pick<IResume, "uid">,
        },
        calendar: (Pick<ICalendarItem, "uid" | "title"> & {
          forWorkshop: Pick<IApplicationWorkshop,
                            "uid"
                              | "titleEn"
                              | "titleHr"
                              | "descriptionEn"
                              | "descriptionHr"
                              | "reservation">,
        })[],
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
                approval {
                    booth
                    workshopParticipants
                    talkParticipants
                    panel
                    cocktail
                }
            }
            profile {
                resume {
                    uid
                }
            }
            calendar(filter: { type: "workshop" }) {
                uid
                title
                forWorkshop {
                    uid
                    titleHr
                    titleEn
                    descriptionHr
                    descriptionEn
                    reservation
                }
            }
        }
        `,
      })();

      const signupQuery = useMutation<{ updateEventReservation: number | null, }, IMutationUpdateEventReservationArgs>(gql`
        mutation Signup($input: EventReservationUpdateInput!) {
          updateEventReservation(input: $input)
        }
      `);

      const translateFor =
        <Key extends string, Item extends Record<`${ Key }En` | `${ Key }Hr`, any>>(
          item: Item,
          key: Key,
          ) =>
          computed<Item[`${ Key }Hr` | `${ Key }En`]>(
            () =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              translationsStore.currentLanguage === Language.HR
                ? item[`${ key }Hr`]
                : item[`${ key }En`],
          )
      ;

      const booths = computed(() => Object.fromEntries((resp?.data?.booths || []).map((b) => [ b.key || "", b.name ])));
      const approval = resp?.data?.companyApplication?.approval;
      const isApproved = companyStore.isApplicationApproved(approval);
      const isApprovedWithoutBooth = companyStore.isApplicationApproved(omit([
        "booth",
      ], approval || {}));
      const resume = resp?.data?.profile?.resume;
      const calendar = reactive((resp?.data?.calendar || []).map((x) => ({
        ...x,
        loading: false,
      })));

      return {
        calendar,
        translateFor,
        user: computed(() => userStore.user),
        resume,
        formatDate,
        booths,
        currentSeason: computed(() => seasonsStore.currentSeason),
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        hasCompany: computed(() => userStore.hasCompany),
        companyApplication: computed(() => resp?.data?.companyApplication),
        isApproved,
        isApprovedWithoutBooth,
        async handleSignupFor(item: (typeof calendar)[0]) {
          item.loading = true;
          const resp = await signupQuery({
            input: {
              id: item.forWorkshop.uid,
              type: EventType.workshop,
              status: statusFromEventList(item.forWorkshop.reservation ? [] : [ "event" ]),
            },
          }).then((resp) => resp?.data?.updateEventReservation);
          item.loading = false;

          if ("number" !== typeof resp) {
            alert("Something went wrong");
          }

          item.forWorkshop.reservation = resp!;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @import "assets/styles/include";

  .success {
    color: $fer-success;
  }

  .error {
    color: $fer-error;
  }

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
        display: inline-block;
        height: 100%;
        padding: 1rem;
        border-radius: 4px;
        background-color: $fer-white;
        box-shadow: #{map.get($shadows, "shadow-3")};

        > * {
          opacity: .7;
        }

        .qrCode {
          opacity: 1;
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

    .itemApproval {

      .itemContent {

        .applicationItems {

          :global(.pi-check) {
            color: $fer-success;
          }
        }
      }
    }
  }

  .applicationItems {
    font-size: 1em;

    li > strong {

      &::after {
        content: ": ";
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

  .reservationItems {
    overflow-y: scroll;
    height: 100%;
    max-height: 25em;
    opacity: 1 !important;

    dt {
      display: flex;
      align-items: center;
      gap: 1em;
    }
  }
</style>
