import type {
 PropType,
} from "vue";

export const elseNone = <T, C>(check: C, value: T) => check ? value : undefined;
export const orNone = <T>(value: T) => elseNone(value, value);

export type AppOption = {
    label: string,
    value: string,
};
export type AppOptions = AppOption[];
export type AppOptionsProp<T = unknown> = PropType<AppOptions & T>;
