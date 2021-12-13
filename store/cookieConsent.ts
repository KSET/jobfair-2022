import {
  defineStore,
} from "pinia";
import {
  useState as useGtagState,
} from "vue-gtag-next";
import Cookies from "js-cookie";

const COOKIE_NAME = "jf-meetup-cookie-consent";

enum ConsentState {
  Accepted = "ACCEPTED",
  Denied = "DENIED",
  Undecided = "UNDECIDED",
}

export const useCookieConsentStore = defineStore(
  "cookieConsent",
  {
    state: () => ({
      consent: ConsentState.Denied,
    }),

    getters: {
      hasConsent(state) {
        return state.consent === ConsentState.Accepted;
      },

      showConsent(state) {
        return state.consent === ConsentState.Undecided;
      },
    },

    actions: {
      fetchConsent() {
        const consent = Cookies.get(COOKIE_NAME) as (ConsentState | undefined);

        this.processConsent(consent || ConsentState.Undecided);
      },

      processConsent(status: ConsentState) {
        this.consent = status;

        const cookieValue = Cookies.get(COOKIE_NAME);
        const cookieValueMatches = cookieValue === status;

        if (!cookieValue || !cookieValueMatches) {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);

          Cookies.set(
            COOKIE_NAME,
            status,
            {
              expires: nextMonth,
              path: "/",
            },
          );
        }

        const {
          isEnabled,
        } = useGtagState();

        if (!isEnabled) {
          return;
        }

        switch (status) {
          case ConsentState.Accepted:
            isEnabled.value = true;
            break;

          default:
            isEnabled.value = false;
            break;
        }
      },

      acceptConsent() {
        this.processConsent(ConsentState.Accepted);
      },

      denyConsent() {
        this.processConsent(ConsentState.Denied);
      },

      clearConsent() {
        this.processConsent(ConsentState.Undecided);
      },
    },
  },
);
