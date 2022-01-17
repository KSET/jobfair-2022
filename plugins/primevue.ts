import PrimeVue from "primevue/config";
import Button from "primevue/button";
import ToastService from "primevue/toastservice";
import {
  defineNuxtPlugin,
} from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue, {
    ripple: true,
    inputStyle: "outlined",
  });

  nuxtApp.vueApp.use(ToastService);

  nuxtApp.vueApp.component("p-button", Button);
});
