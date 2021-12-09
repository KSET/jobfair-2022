import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Card from "primevue/card";
import Image from "primevue/image";
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
  nuxtApp.vueApp.component("p-card", Card);
  nuxtApp.vueApp.component("p-img", Image);
});
