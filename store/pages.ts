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

export const usePagesStore = defineStore(
  "pages",
  {
    state: () => ({}),

    getters: {
      pages() {
        const seasonsStore = useSeasonsStore();

        return [
          {
            name: "page.name.home",
            to: { name: "index" },
          },
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
            name: "page.name.contact",
            to: { name: "contact" },
          },
          {
            name: "page.name.press",
            to: { name: "press" },
          },
        ].filter((page) => page.if ? page.if() : true);
      },

      profilePages() {
        const userStore = useUserStore();
        const seasonsStore = useSeasonsStore();
        const companyStore = useCompanyStore();

        return [
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
            name: "profile.company",
            to: { name: "profile-me-company" },
            if: () => userStore.hasCompany,
          },
          {
            name: "profile.company.signup",
            to: { name: "profile-me-company-signup" },
            if: () => userStore.hasCompany && seasonsStore.applicationsOpen,
          },
          {
            name: "profile.company.application.edit",
            to: { name: "profile-me-company-application-edit" },
            if: () => userStore.hasCompany && !seasonsStore.applicationsOpen && companyStore.hasApplicationApproved,
          },
          {
            name: "profile.company.resumes",
            to: { name: "profile-me-company-resumes" },
            if: () => userStore.hasCompany,
          },
          {
            name: "profile.company.scan-qr",
            to: { name: "profile-me-company-scan-qr" },
            if: () => userStore.hasCompany,
          },
          {
            name: "profile.cv",
            to: { name: "profile-me-cv" },
          },
        ].filter((page) => page.if ? page.if() : true);
      },
    },
  },
);
