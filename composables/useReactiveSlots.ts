import {
  onBeforeUpdate,
  reactive,
  toRefs,
  useSlots,
} from "vue";

export default function <T extends string>(...slots: T[]) {
  type SlotRecord = Record<T, boolean>;

  const $slots = useSlots();

  const slotExists = reactive(Object.fromEntries(
    slots.map((slot) => [
      slot,
      $slots[slot] !== undefined,
    ]),
  ) as SlotRecord);

  onBeforeUpdate(() => {
    for (const slot of slots) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Really weird type issue (TS2322: Type 'boolean' is not assignable to type 'UnwrapNestedRefs>[T]'.)
      slotExists[slot] = $slots[slot] !== undefined;
    }
  });

  return toRefs(slotExists);
}
