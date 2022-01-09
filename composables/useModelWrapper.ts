import {
  computed,
} from "vue";

export default <Props extends Record<string, unknown>, Event extends string, Param>(props: Props, emit: (event: Event, ...params: Param[]) => void) =>
  <Prop extends keyof Props>(prop: Prop) =>
    computed({
      get: () => props[prop],
      set: (value) => emit(`update:${ prop.toString() }` as Event, value as Param),
    })
;
