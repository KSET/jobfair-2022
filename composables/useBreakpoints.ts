import {
  useBreakpoints as useBreakpointsVueuse,
} from "@vueuse/core";

export const useBreakpoints = () => useBreakpointsVueuse({
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
});
