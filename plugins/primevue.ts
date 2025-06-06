import PrimeVue from "primevue/config";
import Button from "primevue/button";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import {
  defineNuxtPlugin,
} from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.vueApp.use(PrimeVue, {
  //   ripple: true,
  //   inputStyle: "outlined",
  // });

  nuxtApp.vueApp.use(ToastService as never);
  nuxtApp.vueApp.use(ConfirmationService as never);

  nuxtApp.vueApp.component("p-button", Button);
});
