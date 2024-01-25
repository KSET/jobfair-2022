import {
  computed,
} from "vue";
import {
  type LocationQuery,
  type RouteParams,
  type RouteRecordName,
  useRoute,
} from "vue-router";
import {
  encodeRedirectParam,
} from "~/helpers/url";

type Route = {
  name?: RouteRecordName | null,
  query: LocationQuery,
  params: RouteParams,
};

export const joinNowRoute = ($route: Route) => {
  const redirectInfo = $route.query.r;
  const fallbackRouteName = "index";

  const routeName = String($route.name ?? fallbackRouteName);

  return {
    name: "login",
    query: {
      r: redirectInfo ?? encodeRedirectParam({
        name: "login" !== routeName ? routeName : fallbackRouteName,
        params: $route.params,
      }),
    },
  };
};

export default function() {
  return computed(() => {
    const $route = useRoute();

    return joinNowRoute($route);
  });
}
