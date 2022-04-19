import {
  computed,
} from "vue";
import type {
  WritableComputedRef as ComputedRef,
} from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type WritableComputedRef<Name, T> = ComputedRef<T>;

export default <Props extends Record<string, unknown>, Event extends string, Param>(props: Props, emit: (event: Event, ...params: Param[]) => void) =>
  <Prop extends keyof Props, ModelType = Props[Prop]>(prop: Prop) =>
    computed({
      get: () => props[prop],
      set: (value) => emit(`update:${ prop.toString() }` as Event, value as Param),
    }) as WritableComputedRef<Prop, ModelType>
;
