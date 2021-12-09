import VueGtag from "vue-gtag-next";
import {
  defineNuxtPlugin,
} from "#app";


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: "UA-146832367-1",
    },
    isEnabled: false,
    useDebugger: true,
  });

  // trackRouter(nuxtApp.vueApp);
});
