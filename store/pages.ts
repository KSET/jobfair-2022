import {
  defineStore,
} from "pinia";
import {
  useUserStore,
} from "~/store/user";
import {
  useSeasonsStore,
} from "~/store/seasons";
import {
  useCompanyStore,
} from "~/store/company";

export type Page = {
  name: string,
  to: Record<string, unknown>,
  if?: () => boolean,
};

const toPages = <T extends Page>(pages: T[] | readonly T[]) =>
  pages
    .map((x) => ({
      ...x,
      id: `${ x.name }_${ JSON.stringify(x.to) }`,
    }))
    .filter((x) => x.if ? x.if() : true)
;

export const usePagesStore = defineStore(
  "pages",
  {
    state: () => ({}),

    getters: {
      pages() {
        const seasonsStore = useSeasonsStore();

        return toPages([
          // {
          //   name: "page.name.home",
          //   to: { name: "index" },
          // },
          {
            name: "page.name.news",
            to: { name: "news" },
          },
          {
            name: "page.name.schedule",
            to: { name: "schedule" },
            if: () => seasonsStore.isScheduleShown,
          },
          {
            name: "page.name.about",
            to: { name: "about" },
          },
          {
            name: "page.name.participants",
            to: { name: "participants" },
            if: () => seasonsStore.areParticipantsShown,
          },
          {
            name: "page.name.internships",
            to: { name: "summer-internships" },
            if: () => seasonsStore.areParticipantsShown,
          },
          // {
          //   name: "page.name.contact",
          //   to: { name: "contact" },
          // },
          {
            name: "page.name.press",
            to: { name: "press" },
          },
        ] as const);
      },

      profilePages() {
        const userStore = useUserStore();
        const seasonsStore = useSeasonsStore();
        const companyStore = useCompanyStore();

        return toPages([
          {
            name: "page.name.home",
            to: { name: "index" },
          },
          {
            name: "profile.my-profile",
            to: { name: "profile-me" },
          },
          {
            name: "profile.settings",
            to: { name: "profile-me-settings" },
          },
          {
            name: "profile.reservations",
            to: { name: "profile-me-reservations" },
            if: () => seasonsStore.isScheduleShown,
          },
          {
            name: "profile.company",
            to: { name: "profile-me-company" },
            if: () => userStore.hasCompany,
          },
          {
            name: "profile.company.register",
            to: { name: "profile-register-company" },
            if: () => !userStore.hasCompany && seasonsStore.applicationsOpen,
          },
          {
            name: "profile.company.signup",
            to: { name: "profile-me-company-signup" },
            if: () => userStore.hasCompany && seasonsStore.applicationsOpen,
          },
          {
            name: "profile.company.application.edit",
            to: { name: "profile-me-company-application-edit" },
            if: () => userStore.hasCompany && !seasonsStore.applicationsOpen && companyStore.hasApplicationApproved && seasonsStore.areApplicationsEditable,
          },
          {
            name: "profile.company.resumes",
            to: { name: "profile-me-company-resumes" },
            if: () => userStore.hasCompany && companyStore.canViewResumes,
          },
          {
            name: "profile.company.scan-qr",
            to: { name: "profile-me-company-scan-qr" },
            if: () => userStore.hasCompany && companyStore.canScanUsers,
          },
          {
            name: "profile.cv",
            to: { name: "profile-me-cv" },
            if: () => !userStore.hasCompany,
          },
        ] as const);
      },
    },
  },
);
