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

      <template v-if="true || resume">
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
          <!-- <div :class="$style.itemActions">
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
          </div> -->
        </div>

        <template v-if="isSignUpPossible">
          <div :class="[$style.item, $style.signUp]">
            <div :class="$style.itemContent">
              <h2 :class="$style.itemHeader">
                <translated-text trans-key="profile.events.sign-up" />
              </h2>
              <dl :class="$style.reservationItems">
                <dt
                  v-for="item in calendar"
                  :key="item.uid"
                  :class="$style.reservationItem"
                >
                  <p-button
                    :loading="item.loading"
                    :class="[ item.reservation ? $style.signoffButton : $style.signupButton ]"
                    @click="handleSignupFor(item)"
                  >
                    <translated-text v-if="item.reservation" trans-key="company.event.user.sign-off" />
                    <translated-text v-else trans-key="company.event.user.sign-up" />
                  </p-button>
                  <strong :title="item.description">
                    <nuxt-link
                      :to="{ name: 'calendar-event-uid', params: { uid: item.calendarUid } }"
                      target="_blank"
                    >
                      [{{ item.companyName }}] {{ item.title }}
                    </nuxt-link>
                  </strong>
                </dt>
              </dl>
            </div>
            <div :class="$style.itemActions">
              <nuxt-link
                :to="{ name: 'schedule' }"
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
      </template>
      <div v-if="false && !hasCompany" :class="$style.item">
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
      <template
        v-else-if="!applicationsOpen && companyApplication && companyApplication.approval"
      >
        <div
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
          <div v-if="isApproved && isApprovedWithoutBooth && applicationsEditable" :class="$style.itemActions">
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
          v-if="isApprovedWithEvents"
          :class="[$style.item, $style.itemApproval]"
        >
          <div :class="$style.itemContent">
            <h2 :class="$style.itemHeader">
              <translated-text trans-key="profile.company.userApplications.header" />
            </h2>
            <ul
              :class="$style.applicationItems"
            >
              <li
                v-for="(participants, name) in userApplications"
                :key="name"
              >
                <strong>
                  <translated-text :trans-key="`profile.company.${name}`" />
                </strong>
                <em v-text="participants" />
              </li>
            </ul>
          </div>
        </div>

        <div
          v-if="isEventOngoing"
          :class="[$style.item, $style.itemApproval]"
        >
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.company.scanUsers.header" />
          </h2>
          <div :class="$style.itemActions">
            <nuxt-link
              :to="{ name: 'profile-me-company-resumes' }"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="profile.company.scanUsers.resumes"
                />
              </p-button>
            </nuxt-link>

            <nuxt-link
              :to="{ name: 'profile-me-company-scan-qr' }"
              class="ml-auto"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="profile.company.scanUsers.scan"
                />
              </p-button>
            </nuxt-link>
          </div>
        </div>

        <div
          v-if="isFeedbackOpen"
          :class="[$style.item, $style.itemApproval]"
        >
          <div :class="$style.itemContent">
            <h2 :class="$style.itemHeader">
              <translated-text trans-key="profile.company.feedback.header" />
            </h2>
            <p>
              <translated-text trans-key="profile.company.feedback.text" />
            </p>
          </div>
          <div :class="$style.itemActions">
            <nuxt-link
              :to="{ name: 'profile-me-company-resumes' }"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="profile.company.scanUsers.resumes"
                />
              </p-button>
            </nuxt-link>

            <nuxt-link
              :to="{ name: 'profile-me-company-feedback' }"
              class="ml-auto"
            >
              <p-button
                class="p-button-secondary"
                tabindex="-1"
              >
                <translated-text
                  trans-key="profile.company.feedback.submit"
                />
              </p-button>
            </nuxt-link>
          </div>
        </div>
      </template>
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
    fromPairs,
    omit,
    pick,
    toPairs,
  } from "rambdax";
  import AppImg from "../../../components/util/app-img.vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useMutation,
    useQuery,
  } from "~/composables/useQuery";
  import {
    ICalendarItem,
    IMutationUpdateEventReservationArgs,
    IProfileBaseDataQuery,
    IProfileBaseDataQueryVariables,
    ProfileBaseData,
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
    useTranslationsStore,
  } from "~/store/translations";
  import {
    Dict,
    MaybeComputedRef,
  } from "~/helpers/type";

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
      const resp = await useQuery<IProfileBaseDataQuery, IProfileBaseDataQueryVariables>({
        query: ProfileBaseData,
      })();

      const signupQuery = useMutation<{ updateEventReservation: number | null, }, IMutationUpdateEventReservationArgs>(gql`
        mutation Signup($input: EventReservationUpdateInput!) {
          updateEventReservation(input: $input)
        }
      `);

      const booths = computed(() => Object.fromEntries((resp?.data?.booths ?? []).map((b) => [ b.key ?? "", b.name ])));
      const approval = resp?.data?.companyApplication?.approval;
      const isApproved = companyStore.isApplicationApproved(approval);
      const isApprovedWithoutBooth = companyStore.isApplicationApproved(omit([
        "booth",
      ], approval ?? {}));
      const isApprovedWithEvents = companyStore.isApplicationApproved(pick([
        "workshopParticipants",
        "talkParticipants",
        "panel",
      ], approval ?? {}));
      const resume = resp?.data?.profile?.resume;
      const hasReservation = <T>(x: T): T extends { reservation: unknown, } ? true : false => {
        if ("object" !== typeof x || null === x) {
          return false as T extends { reservation: unknown, } ? true : false;
        }

        return "reservation" in x as T extends { reservation: unknown, } ? true : false;
      };
      const calendarWithEventItems = resp?.data?.calendar?.filter((x) => Object.values(x).some(hasReservation));
      const calendar = reactive(
        calendarWithEventItems
          ?.map((x) => {
            type TEvent = NonNullable<ICalendarItem["forWorkshop"] | ICalendarItem["forTalk"] | ICalendarItem["forPanel"]>;
            const [ key, event ] = Object.entries(x).find(([ _, x ]) => hasReservation(x)) as [ string, TEvent ];

            const type = (() => {
              switch (key) {
                case "forWorkshop":
                  return EventType.Workshop;
                case "forTalk":
                  return EventType.Talk;
                case "forPanel":
                  return EventType.Panel;
              }
            })()!;
            const {
              uid,
              reservation,
            } = event;

            const base = {
              calendarUid: x.uid,
              uid,
              type,
              reservation,
              loading: false,
              companyName: x.title,
              title: "[unknown]" as MaybeComputedRef<string>,
              description: "[unknown]" as MaybeComputedRef<string>,
            };

            if ("name" in event) {
              base.title = event.name;
              base.description = event.description;
            } else {
              base.title = computed(() => translationsStore.translateFor(event, "title"));
              base.description = computed(() => translationsStore.translateFor(event, "description"));
            }

            return base;
          }) ?? []
        ,
      );

      type ObjectFilters<T extends Dict | null | undefined> = { [Key in keyof NonNullable<T>]: ((param: NonNullable<T>[Key]) => boolean) };
      type ObjectFiltersPartial<TDict extends Dict, TFilters extends Partial<ObjectFilters<TDict>>> =
        {
          [Key in keyof TDict]: TFilters[Key] extends never ? TDict[Key] : (TDict[Key] | undefined);
        }
      ;

      const pickIf = <TFrom extends Dict | null | undefined, TFilter extends Partial<ObjectFilters<TFrom>>>(obj: TFrom, filter: TFilter) => {
        if (!obj) {
          return null;
        }

        const objParis = toPairs(obj);

        return fromPairs(objParis.filter(([ key, value ]) => {
          if (!(key in filter)) {
            return true;
          }

          return filter[key]?.(value as never);
        })) as unknown as ObjectFiltersPartial<NonNullable<TFrom>, TFilter>;
      };

      const userApplications = computed(() => {
        const approvedItems = resp?.data?.companyApplication?.approval;
        const userApplications = resp?.data?.companyApplication?.userApplications;

        return pickIf(userApplications!, {
          talk: () => 0 < (approvedItems?.talkParticipants ?? 0),
          workshop: () => 0 < (approvedItems?.workshopParticipants ?? 0),
        })!;
      });

      return {
        calendar,
        userApplications,
        user: computed(() => userStore.user!),
        resume,
        formatDate,
        booths,
        currentSeason: computed(() => seasonsStore.currentSeason),
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        applicationsEditable: computed(() => seasonsStore.areApplicationsEditable),
        isEventOngoing: computed(() => seasonsStore.isEventOngoing),
        isSignUpPossible: computed(() => seasonsStore.isSignUpPossible),
        isFeedbackOpen: computed(() => seasonsStore.isFeedbackOpen),
        hasCompany: computed(() => userStore.hasCompany),
        companyApplication: computed(() => resp?.data?.companyApplication),
        isApproved,
        isApprovedWithoutBooth,
        isApprovedWithEvents,
        async handleSignupFor(item: (typeof calendar)[number]) {
          item.loading = true;
          const resp = await signupQuery({
            input: {
              id: item.uid,
              type: item.type,
              status: statusFromEventList(item.reservation ? [] : [ "event" ]),
            },
          }).then((resp) => resp?.data?.updateEventReservation);
          item.loading = false;

          if ("number" !== typeof resp) {
            alert("Something went wrong");
          }

          item.reservation = resp!;
        },
      };
    },
  });
</script>

<style lang="scss" module>
  @use "sass:map";
  @use "sass:color";
  @import "assets/styles/include";

  .success {
    color: $fer-success;
  }

  .error {
    color: $fer-error;
  }

  .items {
    display: grid;

    --item-columns: 3;

    gap: 1rem;
    grid-template-columns: repeat(var(--item-columns), minmax(0, 1fr));

    @media screen and (width <= 1500px) {
      --item-columns: 2;
    }

    @include media(lg) {
      --item-columns: 1;
    }
  }

  .item {
    display: flex;
    flex-direction: column;
    padding: var(--item-padding);
    transition-property: padding;
    background-color: $fer-gray;
    box-shadow: #{map.get($shadows, "shadow-3")};
    gap: var(--item-padding);

    &.signUp {
      min-height: fit-content;
      grid-column: span 1;

      @media screen and (width <= 1500px) {
        grid-column: span var(--item-columns);
      }
    }

    --item-padding: .875rem;

    @include media(lg) {
      --item-padding: .5rem;
    }
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
  }

  .qrCode {
    opacity: 1;
  }

  .itemHeader {
    margin: 0 0 2.5rem;
    opacity: 1;
    color: $fer-dark-blue;
  }

  .itemActions {
    display: flex;
    margin-top: auto;

    :global(.p-button) {
      padding: .625rem 1.125rem;
      transition-property: padding;

      @include media(lg) {
        padding: .875rem 1.25rem;
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
    display: flex;
    overflow-y: scroll;
    flex-direction: column;
    height: 100%;
    max-height: 25em;
    opacity: 1 !important;
    gap: 1em;
  }

  .reservationItem {
    display: flex;
    align-items: center;
    gap: 1em;

    a {
      color: $fer-black;

      &:hover {
        text-decoration: underline;
      }
    }

    .signupButton, .signoffButton {
      transition: background-color .2s ease;

      &:hover {
        transition: none;
      }
    }

    .signoffButton {
      background-color: $fer-dark-blue;

      &:hover {
        background-color: color.adjust($fer-dark-blue, $alpha: -.12);
      }
    }
  }
</style>
