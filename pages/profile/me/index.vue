<template>
  <app-user-profile-container>
    <h1>
      <translated-text trans-key="profile.header" />
    </h1>

    <div v-if="user" :class="$style.items">
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
            <div :class="$style.itemContent" style="flex: 1;">
              <h2 :class="$style.itemHeader">
                <translated-text trans-key="profile.events.sign-up" />
              </h2>
              <p>
                <translated-text trans-key="profile.events.sign-up.text" />
              </p>
            </div>
            <div :class="$style.itemActions">
              <nuxt-link
                :to="{ name: 'schedule' }"
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
              <nuxt-link
                :to="{ name: 'profile-me-reservations' }"
                class="ml-auto"
              >
                <p-button
                  class="p-button-secondary"
                  tabindex="-1"
                >
                  <translated-text
                    trans-key="profile.reservations"
                  />
                </p-button>
              </nuxt-link>
            </div>
          </div>
        </template>
      </template>
      <div v-if="!hasCompany" :class="$style.item">
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.resume.header" />
          </h2>

          <div v-if="!resume">
            <translated-text trans-key="profile.resume.unsubmitted" />
          </div>
          <div v-else>
            <translated-text trans-key="profile.resume.submitted" />
            <i class="pi pi-check" />
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
                v-if="!resume"
                trans-key="profile.resume.create"
              />
              <translated-text
                v-else
                trans-key="profile.resume.update"
              />
            </p-button>
          </nuxt-link>
        </div>
      </div>

      <div
        v-if="isEventOngoing && isScanner"
        :class="$style.item"
      >
        <div :class="$style.itemContent">
          <h2 :class="$style.itemHeader">
            <translated-text trans-key="profile.gate-guardian.header" />
          </h2>
          <p>
            <translated-text trans-key="profile.gate-guardian.text" />
          </p>
        </div>
        <div :class="$style.itemActions">
          <nuxt-link
            :to="{ name: 'gate-guardian' }"
            class="ml-auto"
          >
            <p-button
              class="p-button-secondary"
              tabindex="-1"
            >
              <translated-text
                trans-key="profile.gate-guardian.go"
              />
            </p-button>
          </nuxt-link>
        </div>
      </div>

      <div
        v-if="applicationsOpen && !hasCompany"
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
          <NuxtLink
            :to="{ name: 'profile-register-company' }"
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
          </NuxtLink>
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
              <li v-if="companyApplication.fusion">
                <strong>
                  <translated-text trans-key="profile.company.fusion" />
                </strong>
                <em v-text="companyApplication.fusion.titleEn" />
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
              <li v-if="companyApplication.wantsQuest">
                <strong>
                  <translated-text trans-key="profile.company.quest" />
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
                <em v-text="booths[companyApplication.booth!]" />
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
              <li v-if="companyApplication.approval.fusionParticipants">
                <strong>
                  <translated-text trans-key="profile.company.fusion" />
                </strong>
                <em>
                  {{ companyApplication.approval.fusionParticipants }}
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
              <li v-if="companyApplication.approval.quest">
                <strong>
                  <translated-text trans-key="profile.company.quest" />
                </strong>
                <em>
                  <i class="pi pi-check" />
                </em>
              </li>
              <li>
                <strong>
                  <translated-text trans-key="profile.company.internship" />
                </strong>
                <em v-if="companyApplication.internship">
                  <i class="pi pi-check" />
                </em>
                <translated-text v-else trans-key="profile.company.internship.missingCompanyInfo" />
              </li>
            </ul>
          </div>
          <div v-if="isApproved && applicationsEditable" :class="$style.itemActions">
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
          v-if="false && isEventOngoing"
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
        <template v-if="isEventOngoingOrLater">
          <div :class="[$style.item, $style.itemApproval]">
            <h2 :class="$style.itemHeader">
              <translated-text trans-key="profile.company.scanUsers.header" />
            </h2>
            <div :class="$style.itemActions">
              <nuxt-link
                :to="{ name: 'profile-me-company-scans-list' }"
              >
                <p-button
                  class="p-button-secondary"
                  tabindex="-1"
                >
                  <translated-text
                    trans-key="profile.company.scanUsers.scanned"
                  />
                </p-button>
              </nuxt-link>

              <nuxt-link
                v-if="isEventOngoing"
                :to="{ name: 'profile-me-company-scan-user-qr' }"
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

          <div :class="[$style.item]">
            <div :class="$style.itemContent">
              <h2 :class="$style.itemHeader">
                <translated-text trans-key="profile.company.componentRatings.header" />
              </h2>

              <ul>
                <li v-if="companyApplication.approval.booth">
                  <strong>
                    <translated-text trans-key="profile.company.booth" />
                  </strong>:&nbsp;<span v-text="companyComponentAverageRatings.booth ?? 'N/A'" /> / 10
                </li>
                <li v-if="companyApplication.approval.talkParticipants">
                  <strong>
                    <translated-text trans-key="profile.company.talk" />
                  </strong>:&nbsp;<span v-text="companyComponentAverageRatings.talk ?? 'N/A'" /> / 10
                </li>
                <li v-if="companyApplication.approval.workshopParticipants">
                  <strong>
                    <translated-text trans-key="profile.company.workshop" />
                  </strong>:&nbsp;<span v-text="companyComponentAverageRatings.workshop ?? 'N/A'" /> / 10
                </li>
                <li v-if="companyApplication.approval.fusionParticipants">
                  <strong>
                    <translated-text trans-key="profile.company.fusion" />
                  </strong>:&nbsp;<span v-text="companyComponentAverageRatings.fusion ?? 'N/A'" /> / 10
                </li>
              </ul>
            </div>
            <div :class="$style.itemActions">
              <a href="/api/i/qr/rate/booth" target="_blank" class="ml-auto">
                <p-button
                  class="p-button-secondary"
                  tabindex="-1"
                >
                  <translated-text
                    trans-key="profile.company.rate.showBoothQr"
                  />
                </p-button>
              </a>
            </div>
          </div>
        </template>

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
            <li v-if="companyApplication.fusion">
              <strong>
                <translated-text trans-key="profile.company.fusion" />
              </strong>
              <em v-text="companyApplication.fusion.titleEn" />
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
            <li v-if="companyApplication.wantsQuest">
              <strong>
                <translated-text trans-key="profile.company.quest" />
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
    fromPairs,
    omit,
    pick,
    toPairs,
  } from "rambdax";
  import {
    useToast,
  } from "primevue/usetoast";
  import AppImg from "../../../components/util/app-img.vue";
  import AppUserProfileContainer from "~/components/AppUserProfileContainer.vue";
  import {
    useQuery,
  } from "~/composables/useQuery";
  import {
    type ICalendarItem,
    type IProfileBaseDataQuery,
    type IProfileBaseDataQueryVariables,
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
  } from "~/helpers/event-status";
  import {
    useTranslationsStore,
  } from "~/store/translations";
  import {
    type Dict,
    type MaybeComputedRef,
  } from "~/helpers/type";
  import {
    useCalendarStore,
  } from "~/store/calendar";

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
      const calendarStore = useCalendarStore();
      const toast = useToast();

      const resp = await useQuery<IProfileBaseDataQuery, IProfileBaseDataQueryVariables>({
        query: ProfileBaseData,
      })();

      seasonsStore.setCurrentSeason(resp?.data?.currentSeason ?? null);
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
        user: computed(() => userStore.user),
        resume,
        formatDate,
        booths,
        currentSeason: computed(() => seasonsStore.currentSeason!),
        companyComponentAverageRatings: computed(() => {
          const currentLocale = translationsStore.currentLanguageIso;
          const ratingsList = seasonsStore.currentSeason?.companyComponentAverageRatings ?? [];

          const mapped = ratingsList.map((x) => [
            x.component,
            x.averageRating.toLocaleString(currentLocale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          ]);

          return Object.fromEntries(mapped) as Record<string, string>;
        }),
        applicationsOpen: computed(() => seasonsStore.applicationsOpen),
        applicationsEditable: computed(() => seasonsStore.areApplicationsEditable),
        isEventOngoing: computed(() => seasonsStore.isEventOngoing),
        isEventOngoingOrLater: computed(() => {
          if (seasonsStore.isEventOngoing) {
            return true;
          }

          const now = new Date();
          const endsAt = seasonsStore.currentSeason?.endsAt as string | Date | undefined;
          if (!endsAt) {
            return false;
          }

          return new Date(endsAt) >= now;
        }),
        isSignUpPossible: computed(() => seasonsStore.isSignUpPossible),
        isFeedbackOpen: computed(() => seasonsStore.isFeedbackOpen),
        isScanner: computed(() => userStore.isScanner),
        hasCompany: computed(() => userStore.hasCompany),
        companyApplication: computed(() => resp?.data?.companyApplication),
        isApproved,
        isApprovedWithoutBooth,
        isApprovedWithEvents,
        async handleSignupFor(item: (typeof calendar)[number]) {
          await calendarStore.toggleEventReservation(item, {
            toastErrors: toast,
            updateItem: true,
          });
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
      display: flex;
      flex-direction: column;

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

    @include media(lg) {
      flex-direction: column-reverse;
      margin: .25em;
      padding: .5em;
      border: 1px solid #{$fer-off-gray};
      border-radius: 4px;
      box-shadow: #{map.get($shadows, "shadow-1")};

      .signupButton, .signoffButton {
        flex: 1 0 auto;
        width: 100%;
      }

      .itemLink {
        font-size: 1.25rem;
        display: block;
        margin-top: .5em;
        text-align: center;
      }
    }

    a {
      color: $fer-dark-blue;

      &:hover {
        text-decoration: underline;
      }
    }

    .signupButton, .signoffButton {
      min-width: 8rem;
      transition: background-color .2s ease;
      hyphens: auto;

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
