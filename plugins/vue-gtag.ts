import VueGtag from "vue-gtag-next";
import {
  defineNuxtPlugin,
} from "#app";


export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: "G-TG1E1XGR6F",
    },
    isEnabled: false,
    useDebugger: true,
  });

  // trackRouter(nuxtApp.vueApp);
});
