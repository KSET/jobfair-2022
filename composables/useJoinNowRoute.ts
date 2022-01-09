import {
  computed,
} from "vue";
import {
  useRoute,
} from "vue-router";
import {
  encodeRedirectParam,
} from "~/helpers/url";

export default function() {
  return computed(() => {
    const $route = useRoute();
    const fallbackRouteName = "index";

    const routeName = String($route.name ?? fallbackRouteName);

    return {
      name: "login",
      query: {
        r: encodeRedirectParam({
          name: "login" !== routeName ? routeName : fallbackRouteName,
          params: $route.params,
        }),
      },
    };
  });
}
